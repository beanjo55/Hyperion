/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
import {default as fs} from "fs";
import {Collection} from "eris";
import {Module} from "./Core/Structures/Module.js";
import {Command} from "./Core/Structures/Command.js";
import {logger} from "./Core/Structures/Logger";
import {default as Redis} from "ioredis";
import {default as axios} from "axios";
import {default as mongoose} from "mongoose";
import {inspect} from "util";
import {CoreOptions, IHyperion, IManagers, GlobalConfig, IUtils, ILogger} from "./types";
import {default as guild} from "./MongoDB/Guild";
import {default as user} from "./MongoDB/User";
import {default as guilduser} from "./MongoDB/Guilduser";
import {default as modlog} from "./MongoDB/Modlog";
import {default as global} from "./MongoDB/Global";
import {default as starModel} from "./MongoDB/Starred";
import {manager as MGM} from "./Core/DataManagers/MongoGuildManager";
import {manager as MUM} from "./Core/DataManagers/MongoUserManager";
import {manager as MMLM} from "./Core/DataManagers/MongoModLogManager";
import {hoistUserResolver} from "./Core/Utils/Resolvers";
import {resolveUser as userResolver} from "./Core/Utils/Resolvers";
import {banResolver} from "./Core/Utils/Resolvers";
import {strictResolver} from "./Core/Utils/Resolvers";
import {sr as sortRoles} from "./Core/Utils/Roles";
import {gc as getColor} from "./Core/Utils/Roles";
import {resolveRole} from "./Core/Utils/Roles";
import {resolveTextChannel} from "./Core/Utils/Channels";
import {resolveVoiceChannel} from "./Core/Utils/Channels";
import {resolveCategory} from "./Core/Utils/Channels";
import {BaseClusterWorker} from "./Core/Cluster/BaseClusterWorker";
import {ShardManager} from "./Core/Sharding/ShardManager";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");


const models = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global,
    starred: starModel
};

const listTokens = {
    dbl: config.coreOptions?.dblToken,
    glenn: config.coreOptions?.glennToken,
    dboats: config.coreOptions?.dboatsToken,
    botsGG: config.coreOptions?.botsGGToken
};

function input2boolean(input: string): boolean | undefined{
    input = input.toLowerCase().trim();
    if(input === "yes" || input === "true"){return true;}
    if(input === "no" || input === "false"){return false;}
    return;
}



const utils: IUtils = {
    hoistResolver: hoistUserResolver,
    resolveUser: userResolver,
    sortRoles: sortRoles,
    getColor: getColor,
    resolveCategory: resolveCategory,
    resolveTextChannel: resolveTextChannel,
    resolveVoicechannel: resolveVoiceChannel,
    input2boolean: input2boolean,
    banResolver: banResolver,
    strictResolver: strictResolver,
    resolveRole: resolveRole
};


export default class HyperionC extends BaseClusterWorker implements IHyperion{
    readonly build: string;
    modules: Collection<Module>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sentry: any;
    commands: Collection<Command>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: ILogger;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bevents: any;
    readonly devPrefix: string;
    readonly modlist: Array<string>;
    readonly version: string;
    readonly adminPrefix: string;
    readonly defaultColor: number;
    readonly mongoOptions: mongoose.ConnectionOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly models: any;
    db: mongoose.Connection;
    global!: GlobalConfig;
    logLevel: number
    managers: IManagers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stars: any;
    utils: IUtils;
    readonly circleCIToken: string;
    redis: Redis.Redis;
    private listTokens: {[key: string]: string};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(manager: ShardManager, coreOptions: CoreOptions, mongoLogin: string, mongoOptions: mongoose.ConnectionOptions,){
        super(manager);
        this.build = coreOptions.build;
        this.modules = new Collection(Module);
        this.commands = new Collection(Command);
        this.logger = logger;
        this.sentry = require("@sentry/node");
        this.sentry.init({
            dsn: coreOptions.sentryDSN,
            environment: coreOptions.build
        });
        this.bevents = {};
        this.modlist = coreOptions.modlist;
        this.models = models;
        this.devPrefix = coreOptions.devPrefix;
        this.adminPrefix = coreOptions.adminPrefix;
        this.mongoOptions = mongoOptions;
        this.defaultColor = coreOptions.defaultColor;
        this.db = this.mongoDB(mongoLogin);
        this.version = require("../package.json").version;
        this.logLevel = coreOptions.defaultLogLevel;
        this.managers = {guild: new MGM, user: new MUM, modlog: new MMLM};
        this.stars = {};
        this.circleCIToken = coreOptions.circleCIToken;
        this.utils = utils;
        this.redis = new Redis({keyPrefix: `${this.build}:`});
        this.listTokens = listTokens;


    }

    async launch(): Promise<void>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (process as NodeJS.EventEmitter).on("uncaughtException", (err: Error, origin: string) =>{
            this.logger.fatal("Hyperion", "An uncaught execption was encountered", "Uncaught Exception");
            this.logger.fatal("Hyperion", inspect(err), "Uncaught Exception Error");
            this.logger.fatal("Hyperion", inspect(origin), "Uncaught Exception Origin");
            this.sentry.captureExecption(err);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (process as NodeJS.EventEmitter).on("unhandledRejection", (reason: Error | any) => {
            this.logger.error("Hyperion", "Encountered unhandled rejection", "Unhandled Rejection");
            this.logger.error("Hyperion", inspect(reason), "Unhandled Rejection");
            this.sentry.captureException(reason);
        });
        this.loadMods();
        this.loadEvents();
        await this.models.global.findOne({}).lean().exec().then((g: GlobalConfig | null) => {
            if(g === null){throw new Error("Unable to get global config");}
            this.global = g;
        });
        this.client.connect();
    }

    async reloadGlobal(): Promise<void>{
        const newGlobal = await this.models.global.findOne({}).lean().exec();
        if(!newGlobal){
            throw new Error("Could not find new global, aborting!");
        }
        this.global = newGlobal;
    }

    loadEvent(eventfile: string): void{
        try{
            const Event = require(`./Events/${eventfile}`).default ?? require(`./Events/${eventfile}`).event;
            this.bevents[Event.name] = Event.handle.bind(this);
            this.client.on(Event.name, this.bevents[Event.name]);
        }catch(err){
            this.logger.error("Hyperion", `Failed to load event ${eventfile}, error: ${err}`, "Event Loading");
        }
    }

    loadEvents(): void{
        const eventfiles = fs.readdirSync(__dirname + "/Events");
        eventfiles.forEach(file => {
            this.loadEvent(file);
        });
    }

    loadMod(modname: string): void{
        try{
            const mod = require(`./Modules/${modname}/${modname}.js`).default;
            this.modules.add(new mod);
        }catch(err){
            this.logger.error("Hyperion", `Failed to load module ${modname}, error: ${err}`, "Module Loading");
        }
    }

    reloadMod(modname: string): void{
        if(!this.modules.has(modname)){throw new Error("Can not reload a module that doesnt exist!");}
        delete require.cache[require.resolve(`./Modules/${modname}/${modname}.js`)];
        this.loadMod(modname);
    }

    reloadEvent(eventname: string): void{
        if(!this.bevents[eventname]){throw new Error("Can not reload an event that doesnt exist!");}
        delete require.cache[require.resolve(`./events/${eventname.charAt(0).toUpperCase() + eventname.slice(1)}.js`)];
        this.client.removeAllListeners(eventname);
        this.loadEvent(eventname.charAt(0).toUpperCase() + eventname.slice(1));
    }

    loadMods(): void{
        this.modlist.forEach(mod =>{
            this.loadMod(mod);
        });
        this.modules.forEach(mod =>{
            if(mod.needsLoad){
                mod.loadMod();
            }
            if(mod.needsInit){
                mod.init(this);
            }
            if(mod.hasCommands){
                mod.loadCommands(this);
            }
        });
        
    }

    private mongoDB(mongoLogin: string): mongoose.Connection{
        this.mongoOptions.dbName = this.build;
        mongoose.connect(mongoLogin, this.mongoOptions);
        mongoose.connection.on("error", () => {
            this.logger.error("MongoDB", "Failed to connect to MongoDB", "Connection");
        });
        mongoose.connection.on("open", () => {
            this.logger.success("MongoDB", "Connected to MongoDB", "Connection");
        });
        return mongoose.connection;
    }

    postAll(): void{
        this.postDBL();
        this.postDBoats();
        this.postGlenn();
        this.postBotsGG();
    }

    async postDBL(): Promise<void>{
        try{
            await axios.post(`https://top.gg/api/bots/${this.client.user.id}/stats`,{
                // eslint-disable-next-line @typescript-eslint/camelcase
                server_count: this.client.guilds.size,
                // eslint-disable-next-line @typescript-eslint/camelcase
                shard_count: this.client.shards.size
            },
            {
                headers: {
                    Authorization: this.listTokens.dbl
                }
            });
            this.logger.success("Hyperion", "Posted stats to DBL!", "DBL Post");
        }catch(err){
            this.logger.warn("Hyperion", `Failed to post stats to DBL, error: ${err}`, "DBL Post");
        }
    }

    async postDBoats(): Promise<void>{
        try{
            await axios.post(`https://discord.boats/api/bot/${this.client.user.id}`,{
                // eslint-disable-next-line @typescript-eslint/camelcase
                shard_count: this.client.shards.size
            },
            {
                headers: {
                    Authorization: this.listTokens.dboats
                }
            });
            this.logger.success("Hyperion", "Posted stats to DBoats!", "DBoats Post");
        }catch(err){
            this.logger.warn("Hyperion", `Failed to post stats to DBoats, error: ${err}`, "DBoats Post");
        }
    }

    async postGlenn(): Promise<void>{
        try{
            await axios.post(`https://glennbotlist.xyz/api/bot/${this.client.user.id}/stats`,{
                serverCount: this.client.guilds.size,
                shardCount: this.client.shards.size
            },
            {
                headers: {
                    Authorization: this.listTokens.glenn
                }
            });
            this.logger.success("Hyperion", "Posted stats to Glenn!", "Glenn Post");
        }catch(err){
            this.logger.warn("Hyperion", `Failed to post stats to Glenn, error: ${err}`, "Glenn Post");
        }
    }

    async postBotsGG(): Promise<void>{
        try{
            await axios.post(`https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`,{
                guildCount: this.client.guilds.size,
                shardCount: this.client.shards.size
            },
            {
                headers: {
                    Authorization: this.listTokens.botsGG
                }
            });
            this.logger.success("Hyperion", "Posted stats to BotsGG!", "BotsGG Post");
        }catch(err){
            this.logger.warn("Hyperion", `Failed to post stats to BotsGG, error: ${err}`, "GleBotsGGnn Post");
        }
    }

    redact(input: string): string{
        let output = input;
        Object.getOwnPropertyNames(this.listTokens).forEach((t: string) => {
            console.log(this.listTokens[t]);
            const rx = new RegExp(this.listTokens[t], "gmi");
            output = output.replace(rx, "No");
        });
        const rx2 = new RegExp((config.token as string), "gmi");
        const rx3 = new RegExp(this.circleCIToken, "gmi");
        output = output.replace(rx2, "No").replace(rx3, "No");
        return output;
    }

}

/*
async function start(): Promise<void>{
    if((config.coreOptions as CoreOptions).init !== undefined && (config.coreOptions as CoreOptions).init === true){
        await models.global.create({});
        await models.user.create({user: "253233185800847361", acks: {developer: true}});
        console.log("Generated new global config. Dont forget to change \"init\" to false. Exiting");
        process.exit(0);
    }
    const Hyperion = new HyperionC(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);
    Hyperion.init().then(() => {
        Hyperion.client.connect();
    });
}

fs.readFile(`${__dirname}/v2.txt`, "utf8", function (error, data) {
    console.log(data);
    start();
});*/
//hi wuper