/* eslint-disable no-unused-vars */
import {default as fs} from "fs";


fs.readFile(`${__dirname}/v2.txt`, "utf8", function (error, data) {
    console.log(data);
    start();
});

import {Client, Collection} from "eris";
import Eris from "eris";
import {Module} from "./Core/Structures/Module.js";
import {Command} from "./Core/Structures/Command.js";
import {logger} from "./Core/Structures/Logger";
import {default as Redis} from "ioredis";
import {default as axios} from "axios";

import mongoose = require("mongoose");
const config = require("../config.json");

import {CoreOptions, HyperionInterface, Managers, GlobalConfig, Utils} from "./types";

import {default as guild} from "./MongoDB/Guild";
import {default as user} from "./MongoDB/User";
import {default as guilduser} from "./MongoDB/Guilduser";
import {default as modlog} from "./MongoDB/Modlog";
import {default as global} from "./MongoDB/Global";
import {default as starModel} from "./MongoDB/Starred";
import {manager as MGM} from "./Core/DataManagers/MongoGuildManager";
import {manager as MUM} from "./Core/DataManagers/MongoUserManager";
import {hur as HoistUserResolver} from "./Core/Utils/Resolvers";
import {ur as userResolver} from "./Core/Utils/Resolvers";
import {sr as sortRoles} from "./Core/Utils/Roles";
import {gc as getColor} from "./Core/Utils/Roles";
import IORedis = require("ioredis");

const models = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global,
    starred: starModel
};

const listTokens = {
    dbl: config.coreOptions.dblToken
};

const utils: Utils = {
    hoistResolver: HoistUserResolver,
    resolveUser: userResolver,
    sortRoles: sortRoles,
    getColor: getColor
};

class hyperion implements HyperionInterface{
    client: Eris.Client;
    readonly build: string;
    modules: Collection<Module>;
    sentry: any;
    commands: Collection<Command>;
    logger: any;
    bevents: any;
    readonly devPrefix: string;
    readonly modlist: Array<string>;
    readonly version: string;
    readonly adminPrefix: string;
    readonly defaultColor: number;
    readonly mongoOptions: mongoose.ConnectionOptions;
    readonly models: any;
    db: mongoose.Connection;
    global!: GlobalConfig;
    logLevel: number
    managers: Managers;
    stars: any;
    utils: any;
    readonly circleCIToken: string;
    redis: Redis.Redis;
    private listTokens: {[key: string]: string};

    constructor(token: string, erisOptions: Eris.ClientOptions, coreOptions: CoreOptions, mongoLogin: string, mongoOptions: mongoose.ConnectionOptions){
        this.client = new Client(token, erisOptions);
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
        this.managers = {guild: new MGM, user: new MUM};
        this.stars = {};
        this.circleCIToken = coreOptions.circleCIToken;
        this.utils = utils;
        this.redis = new Redis();
        this.listTokens = listTokens;

    }
    async init(){
        await this.loadMods();
        await this.loadEvents();
        await this.models.global.findOne({}).lean().exec().then((g: GlobalConfig | null) => {
            if(g === null){throw new Error("Unable to get global config");}
            this.global = g;
        });
    }

    async loadEvent(eventfile: string){
        try{
            const Event = require(`./Events/${eventfile}`).event;
            this.bevents[Event.name] = Event.handle.bind(this);
            this.client.on(Event.name, this.bevents[Event.name]);
        }catch(err){
            this.logger.error("Hyperion", "Event Loading", `Failed to load event ${eventfile}, error: ${err}`);
        }
    }

    async loadEvents(){
        const eventfiles = fs.readdirSync(__dirname + "/Events");
        eventfiles.forEach(file => {
            this.loadEvent(file);
        });
    }

    async reloadEvent(){

    }

    async loadMod(modname: string){
        try{
            const mod = require(`./Modules/${modname}/${modname}.js`).default;
            this.modules.add(new mod);
        }catch(err){
            this.logger.error("Hyperion", "Module Loading", `Failed to load module ${modname}, error: ${err}`);
        }
    }

    async loadMods(){
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

    mongoDB(mongoLogin: string){
        this.mongoOptions.dbName = this.build;
        mongoose.connect(mongoLogin, this.mongoOptions);
        mongoose.connection.on("error", () => {
            this.logger.error("MongoDB", "Connection", "Failed to connect to MongoDB");
        });
        mongoose.connection.on("open", () => {
            this.logger.success("MongoDB", "Connection", "Connected to MongoDB");
        });
        return mongoose.connection;
    }

    async postDBL(){
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
            this.logger.success("Hyperion", "DBL Post", "Posted stats to DBL!");
        }catch(err){
            this.logger.warn("Hyperion", "DBL Post", `Failed to post stats to DBL, error: ${err}`);
        }
    }
}


async function start(){
    if(config.coreOptions.init !== undefined && config.coreOptions.init === true){
        await models.global.create({});
        await models.user.create({user: "253233185800847361", acks: {developer: true}});
        console.log("Generated new global config. Dont forget to change \"init\" to false. Exiting");
        process.exit(0);
    }
    const Hyperion = new hyperion(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);
    Hyperion.init().then(() => {
        Hyperion.client.connect();
    });
}

//hi wuper