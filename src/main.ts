/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
import {default as fs} from "fs";
import {Client, Collection} from "eris";
import {Module} from "./Core/Structures/Module.js";
import {Command} from "./Core/Structures/Command.js";
import {logger} from "./Core/Structures/Logger";
import {default as Redis} from "ioredis";
import {default as axios} from "axios";
import {default as mongoose} from "mongoose";
import {inspect} from "util";
import {IManagers, IUtils, IColors, CoreOptions} from "./types";
import {default as guild} from "./MongoDB/Guild";
import {default as user} from "./MongoDB/User";
import {default as guilduser} from "./MongoDB/Guilduser";
import {default as modlog} from "./MongoDB/Modlog";
import {default as global, IGlobal} from "./MongoDB/Global";
import {default as starModel} from "./MongoDB/Starred";
import {manager as MGM} from "./Core/Managers/MongoGuildManager";
import {manager as MUM} from "./Core/Managers/MongoUserManager";
import {manager as MMLM} from "./Core/Managers/MongoModLogManager";
import {hoistUserResolver} from "./Core/Utils/Resolvers";
import {resolveUser as userResolver} from "./Core/Utils/Resolvers";
import {banResolver} from "./Core/Utils/Resolvers";
import {strictResolver} from "./Core/Utils/Resolvers";
import {sortRoles} from "./Core/Utils/Roles";
import {getColor} from "./Core/Utils/Roles";
import {resolveRole} from "./Core/Utils/Roles";
import {resolveTextChannel} from "./Core/Utils/Channels";
import {resolveVoiceChannel} from "./Core/Utils/Channels";
import {resolveCategory} from "./Core/Utils/Channels";
import * as sentry from "@sentry/node";
import {default as embedModel} from "./MongoDB/Embeds";
import {resolveGuildChannel} from "./Core/Utils/Channels";
import {default as blocked} from "blocked";
import {hasUnicodeEmote} from "./Core/Utils/Emote";
import {sanitizeQuotes} from "./Core/Utils/Sanitize";
import {op8} from "./Core/Utils/Resolvers";
import {default as MGUM} from "./Core/Managers/MongoGuildUserManager";
import {Base} from "./harbringer/structures/Base";
import {IPC} from "./harbringer/structures/IPC";
import {multiArg} from "./Core/Utils/Parse";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");


const models: {[key: string]: mongoose.Model<any>} = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global,
    starred: starModel,
    embed: embedModel
};

const listTokens: {[key: string]: string} = {
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

function parseMessageLink(input: string): null | {guild: string; channel: string; message: string} {
    const rx = new RegExp(/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/, "gmi");
    const result = rx.exec(input);
    if(result === null){return null;}
    return {guild: result[3], channel: result[4], message: result[5]};
}



const utils: IUtils = {
    hoistResolver: hoistUserResolver,
    resolveUser: userResolver,
    sortRoles,
    getColor,
    resolveCategory,
    resolveTextChannel,
    resolveVoiceChannel,
    input2boolean,
    banResolver,
    strictResolver,
    resolveRole,
    resolveGuildChannel,
    parseMessageLink,
    hasUnicodeEmote,
    sanitizeQuotes,
    op8,
    multiArg
};

const colors: IColors = {
    red: 15541248, 
    yellow: 16771072, 
    green: 65386, 
    orange: 15234850, 
    blue: 30719,
    default: config.coreOptions.defaultColor
};
interface setup {
    client: Client;
    clusterID: number;
    ipc: IPC;
}
const emotes = {
    error: "<:error:732383200436813846>",
    neutral: "<:Neutral:680442866354749444>",
    success: "<:success:732383396432445470>",
    fancySuccess: "<a:fancyCheck:746181287592722472>",
    info: "<:info:747287441739612191>"
};
const coreOptions = config.coreOptions as CoreOptions;
export default class HyperionC extends Base{
    readonly build = coreOptions.build;
    modules: Collection<Module>;
    sentry: sentry.User;
    commands: Collection<Command>;
    logger = logger;
    bevents: {[key: string]: () => void};
    readonly devPrefix = coreOptions.devPrefix;
    readonly modlist = coreOptions.modlist;
    readonly version: string;
    readonly adminPrefix = coreOptions.adminPrefix;
    readonly mongoOptions = config.mongoOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly models = models;
    db: mongoose.Connection;
    mongoose: typeof mongoose;
    global!: IGlobal;
    logLevel = coreOptions.defaultLogLevel;
    managers: IManagers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stars: any;
    utils = utils;
    readonly circleCIToken = coreOptions.circleCIToken;
    redis: Redis.Redis;
    colors = colors;
    private listTokens = listTokens;
    fetch: boolean;
    trueReady = false;
    emotes = emotes;
    constructor(setup: setup){
        super(setup);
        this.modules = new Collection(Module);
        this.commands = new Collection(Command);
        this.sentry = require("@sentry/node");
        this.sentry.init({
            dsn: coreOptions.sentryDSN,
            environment: coreOptions.build
        });
        this.bevents = {};
        this.db = this.mongoDB(config.mongoLogin);
        this.version = require("../package.json").version;
        this.managers = {guild: new MGM, user: new MUM, modlog: new MMLM, guildUser: new MGUM};
        this.stars = {};
        this.redis = new Redis({keyPrefix: `${this.build}:`});
        this.fetch = coreOptions.fetch ?? true;
        this.mongoose = mongoose;
    }

    async launch(): Promise<void>{
        (process as NodeJS.EventEmitter).on("uncaughtException", (err: Error, origin: string) =>{
            this.logger.fatal("Hyperion", "An uncaught execption was encountered", "Uncaught Exception");
            this.logger.fatal("Hyperion", inspect(err.message.toString()), "Uncaught Exception Error");
            this.logger.fatal("Hyperion", inspect(origin.toString()), "Uncaught Exception Origin");
            this.sentry.captureException(inspect(err.message.toString()));
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (process as NodeJS.EventEmitter).on("unhandledRejection", (reason: Error | any) => {
            this.logger.error("Hyperion", "Encountered unhandled rejection", "Unhandled Rejection");
            this.logger.error("Hyperion", inspect(reason, {depth: 0}), "Unhandled Rejection");
            this.sentry.captureException(reason);
        });
        this.loadMods();
        this.loadEvents();
        const global = await this.models.global.findOne({}).lean<IGlobal>().exec() as IGlobal | null;
        if(global === null){throw new Error("Unable to get global config");}
        this.global = global;
        blocked((time) => {
            this.logger.warn("Hyperion", `Process blocked for ${time}ms`, "Process Block");
            this.client.executeWebhook("731192845716947087", "700BnqlIyPgzfIcOhlvO773zjxr0pdxabLHQodXauJOam2HF30564xzZApDeoXLc78CD", {
                embeds: [
                    {
                        title: "Process blocked",
                        color: this.colors.default,
                        timestamp: new Date,
                        footer: {text: this.build},
                        description: `Cluster ${this.clusterID} was blocked for ${time}ms`
                    }
                ]
            });
        }, {threshold: 10000});
        this.trueReady = true;
    }

    async reloadGlobal(): Promise<void>{
        const newGlobal = await this.models.global.findOne({}).lean<IGlobal>().exec() as IGlobal | null;
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

    loadMod(modname: string): Module | undefined{
        try{
            const mod = require(`./Modules/${modname}/${modname}.js`).default;
            return this.modules.add(new mod(this));
        }catch(err){
            this.logger.error("Hyperion", `Failed to load module ${modname}, error: ${err}`, "Module Loading");
        }
    }

    reloadMod(modname: string): void{
        const filename = modname.charAt(0).toUpperCase() + modname.slice(1);
        if(!this.modules.has(modname.toLowerCase())){throw new Error("Can not reload a module that doesnt exist!");}
        delete require.cache[require.resolve(`${__dirname}/Modules/${filename}/${filename}.js`)];
        this.modules.delete(modname.toLowerCase());
        const reloaded = this.loadMod(filename);
        if(reloaded){
            if(reloaded.needsInit){
                reloaded.init(this);
            }
            if(reloaded.hasCommands){
                reloaded.reloadCommands();
            }
        }
    }

    reloadEvent(eventname: string): void{
        if(!this.bevents[eventname]){throw new Error("Can not reload an event that doesnt exist!");}
        delete require.cache[require.resolve(`${__dirname}/Events/${eventname.charAt(0).toUpperCase() + eventname.slice(1)}.js`)];
        this.client.removeAllListeners(eventname);
        this.loadEvent(eventname.charAt(0).toUpperCase() + eventname.slice(1));
    }

    reloadCommand(commandName: string): void{
        if(!this.commands.get(commandName)){throw new Error("Cannot reload a command that doesnt exist!");}
        const moduleName = this.commands.get(commandName)?.module;
        if(!moduleName){throw new Error("Could not find module name to reload command from!");}
        const module = this.modules.get(moduleName);
        if(!module){throw new Error("could not find module to reload from!");}
        module.reloadCommand(commandName);
    }

    loadCommand(commandName: string, moduleName: string): void{
        const module = this.modules.get(moduleName);
        if(!module){throw new Error("Specify a valid module to load from");}
        if(this.commands.has(commandName)){throw new Error("Can not load a duplicate command");}
        module.loadCommand(commandName.charAt(0).toUpperCase() + commandName.slice(1) +".js");

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
                mod.loadCommands();
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
                server_count: this.client.guilds.size,
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