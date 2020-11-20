import {Base} from "./harbringer/index";
import {IPC} from "./harbringer/structures/IPC";
import {Client} from "eris";
import Module from "./Structures/Module";
import Command from "./Structures/Command";
import Utils from "./Structures/Utils";
import {EventEmitter} from "events";
import BaseConfigManager from "./Structures/BaseConfigManager";
import BaseDBManager from "./Structures/BaseDBManager";
import {default as blocked} from "blocked";
import * as sentry from "@sentry/node";
import {default as IORedis} from "ioredis";
import {default as mongoose} from "mongoose";
import logger from "./Structures/Logger";
import {inspect} from "util";
import {default as fs} from "fs";
import BaseDatabaseManager from "./Structures/BaseDBManager";
import RegionalManager from "./Structures/RegionalManager";

const config = require("../config.json");

export type events = "messageCreate";

class InternalEvents extends EventEmitter{
    Hyperion: hyperion;
    constructor(Hyperion: hyperion){
        super();
        this.Hyperion = Hyperion;
    }
}

export type roles = "guild" | "user" | "guilduser" | "embeds" | "tags" | "modlogs" | "moderations" | "stars"

export default class hyperion extends Base{
    modules = new Map<string, Module<unknown>>();
    commands = new Map<string, Command>();
    configManagers = new Map<string, BaseConfigManager<unknown>>();
    dbManagers = new Map<string, BaseDBManager>();
    manager = new RegionalManager(this);
    utils: Utils;
    internalEvents: InternalEvents;
    devPrefix: string;
    adminPrefix: string;
    trueReady = false;
    sentry: sentry.User;
    build: string;
    colors = {
        red: 15541248, 
        yellow: 16771072, 
        green: 65386, 
        orange: 15234850, 
        blue: 30719,
        default: config.coreOptions.defaultColor
    };
    emotes = {
        error: "<:error:732383200436813846>",
        neutral: "<:Neutral:680442866354749444>",
        success: "<:success:732383396432445470>",
        fancySuccess: "<a:fancyCheck:746181287592722472>",
        info: "<:info:747287441739612191>",
        happyKitty: "<a:happykitty:734450859026546699>"
    };
    logger = logger;
    redis!: IORedis.Redis;
    db!: mongoose.Connection;
    constructor(setup: {client: Client; ipc: IPC; clusterID: number}){
        super(setup);
        this.sentry = require("@sentry/node");
        this.sentry.init({
            dsn: config.coreOptions.sentryDSN,
            environment: config.coreOptions.build
        });
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
        this.utils = new Utils(this);
        this.internalEvents = new InternalEvents(this);
        this.devPrefix = config.coreOptions.devPrefix;
        this.adminPrefix = config.coreOptions.adminPrefix;
        this.build = config.coreOptions.build;
    }

    async launch(): Promise<void>{
        blocked((time) => {
            this.client.executeWebhook(config.coreOptions.blockedHook.id, config.coreOptions.blockedHook.token, {
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
        }, {threshold: 1000});
        await this.initMongo();
        this.initRedis();
        this.loadMods(config.coreOptions.modlist);
        this.loadEvents(config.coreOptions.eventlist);
        this.loadConfigManagers();
        this.loadDBManagers();
        this.trueReady = true;
    }

    async loadMod(name: string): Promise<void>{
        const path = `${__dirname}/Modules/${name}/${name}.js`;
        const toLoad = require(path).default;
        if(!toLoad){throw new Error("Loaded module was undefined");}
        const loaded: Module<unknown> = new toLoad(this);
        this.modules.set(loaded.name, loaded);
        await loaded.onLoad();
        if(loaded.hasCommands){loaded.loadCommands();}
    }

    loadMods(list: Array<string>): void{
        list.forEach(async name => {
            await this.loadMod(name);
        });
    }

    reloadMod(path: string): void{
        delete require.cache[require.resolve(path)];
        const toLoad = require(path).default;
        if(!toLoad){throw new Error("Loaded module was undefined");}
        const loaded = new toLoad(this);
        this.modules.set(loaded.name, loaded);
    }

    async unloadMod(mod: Module<unknown>): Promise<void>{
        delete require.cache[require.resolve(mod.path)];
        this.commands.forEach(c => {
            if(c.module === mod.name){this.commands.delete(c.name);}
        });
        await mod.onUnload();
        this.modules.delete(mod.name);
    }

    loadEvent(name: events): void{
        const payload = {name, Hyperion: this};
        function template(this: {name: events; Hyperion: hyperion}, ...args: Array<unknown>){
            if(!this.Hyperion.trueReady){return;}
            this.Hyperion.modules.forEach(mod => {
                if(mod.subscribedEvents.includes(this.name)){(mod[this.name] as (...args: Array<unknown>) => void)(...args);}
            });
        }
        this.client.on(name, template.bind(payload));
    }

    loadEvents(list: Array<events>): void{
        list.forEach(event => this.loadEvent(event));
    }

    unloadEvent(name: events): void{
        this.client.removeAllListeners(name);
    }

    initRedis(): void{
        this.redis = new IORedis({keyPrefix: `${this.build}:`});
        this.redis.on("connect", () => this.logger.success("Hyperion", "Connected to Redis", "Redis"));
        this.redis.on("end", () => this.logger.fatal("Hyperion", "Failed to (re)connect to Redis", "Redis"));
        this.redis.on("close", () => this.logger.warn("Hyperion", "The Redis connection was closed", "Redis"));
        this.redis.on("reconnecting", (time) => this.logger.info("Hyperion", `Attmepting to reconnect to Redis in ${time}ms`, "Redis"));
        this.redis.on("error", (err) => this.logger.error("Hyperion", `Redis encountered an error: ${err.message}`, "Redis"));
    }

    async initMongo(): Promise<void>{
        const mongoOptions = config.mongoOptions;
        mongoOptions.dbName = this.build;
        
        mongoose.connection.on("error", () => this.logger.error("MongoDB", "Failed to connect to MongoDB", "Connection"));
        mongoose.connection.on("open", () => this.logger.success("MongoDB", "Connected to MongoDB", "Connection"));
        await mongoose.connect(config.mongoLogin, mongoOptions);
        this.db = mongoose.connection;
    }

    loadDBManagers(): void{
        try{
            const files = fs.readdirSync(`${__dirname}/Managers/DB`);
            files.forEach(file => {
                try{
                    this.loadDBManager(`${__dirname}/Managers/DB/` + file);
                }catch(err){
                    //logger
                }
            });
        }catch(err){
            //logger
        }
    }

    loadDBManager(path: string): void{
        try{
            const manager = require(path).default;
            if(!manager){throw new Error("Could not load a DB manager at " + path);}
            const loaded: BaseDatabaseManager = new manager(this, path);
            this.dbManagers.set(loaded.db, loaded);
            loaded.onLoad();
        }catch(err){
            //logger
        }
    }

    reloadDBManager(path: string): void{
        delete require.cache[require.resolve(path)];
        this.loadDBManager(path);
    }

    loadConfigManagers(): void{
        try{
            const files = fs.readdirSync(`${__dirname}/Managers/Config`);
            files.forEach(file => {
                try{
                    this.loadConfigManager(`${__dirname}/Managers/Config` + file);
                }catch(err){
                    //logger
                }
            });
        }catch(err){
            //logger
        }
    }

    loadConfigManager(path: string): void{
        try{
            const manager = require(path).default;
            if(!manager){throw new Error("Could not load a config manager at " + path);}
            const loaded: BaseConfigManager<unknown> = new manager(this, path);
            this.configManagers.set(loaded.role, loaded);
        }catch(err){
            //logger
        }
    }

    reloadConfigManager(path: string): void{
        delete require.cache[require.resolve(path)];
        this.loadConfigManager(path);
    }

    reloadUtils(): void{
        delete require.cache[require.resolve("./Structures.Utils.js")];
        const newUtils = require("./Structures/Utils.js").default;
        if(!newUtils){throw new Error("Did not load new utils!");}
        this.utils = new newUtils(this) as Utils;
    }
}

//hi wuper

export interface GuildType {
    guild: string;
    prefix: string;
    modules: {[key: string]: boolean},
    commands: {[key: string]: {
        enabled: boolean;
        allowedRoles: [],
        allowedChannels: [],
        disabledRoles: [],
        disabledChannels: [],
        subcommands?: {[key: string]: {enabled: boolean}};
    }};
    pro: boolean;
    deleted: boolean;
    updatedAt: number;
    deletedAt: number;
    casulaPrefix: boolean;
    cantRunMessage: boolean;
    embedCommonResponses: boolean;
    ignoredChannels: [];
    ignoredRoles: [];
    ignoredUsers: [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}