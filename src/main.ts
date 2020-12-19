import {Base} from "./harbringer/index";
import {IPC} from "./harbringer/structures/IPC";
import {AdvancedMessageContent, Client, Guild, GuildTextableChannel, Member, Message} from "eris";
import Module from "./Structures/Module";
import Command from "./Structures/Command";
import Utils, { ack } from "./Structures/Utils";
import {EventEmitter} from "events";
import BaseConfigManager from "./Structures/BaseConfigManager";
import BaseDBManager from "./Structures/BaseDBManager";
import {default as blocked} from "blocked";
import * as sentry from "@sentry/node";
import {default as IORedis} from "ioredis";
import {default as mongoose, Schema, Document, model, Model} from "mongoose";
import logger from "./Structures/Logger";
import {inspect} from "util";
import {default as fs} from "fs";
import BaseDatabaseManager from "./Structures/BaseDBManager";
import RegionalManager from "./Structures/RegionalManager";
import LangManager from "./Structures/LangManager";

const config = require("../config.json");

export type events = "messageCreate";

class InternalEvents extends EventEmitter{
    Hyperion: hyperion;
    constructor(Hyperion: hyperion){
        super();
        this.Hyperion = Hyperion;
    }
}

export type roles = "guild" | "user" | "guilduser" | "embeds" | "tags" | "modlogs" | "moderations" | "stars" | "notes"

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
    sentry: typeof sentry;
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
    lang = new LangManager(this);
    metadataModels!: {
        module: Model<Document & moduleMeta>;
        command: Model<Document & commandMeta>;
    }
    globalModel!: Model<Document & GlobalType>;
    global!: GlobalType;
    name!: string;
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
        await this.initGlobal();
        this.metadataInit();
        this.initRedis();
        this.loadMods(config.coreOptions.modlist);
        this.loadEvents(config.coreOptions.eventlist);
        this.loadConfigManagers();
        this.loadDBManagers();
        this.name = this.client.user.username;
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
        const exists = this.metadataModels.module.exists({name: loaded.name});
        if(exists){
            this.metadataModels.module.updateOne({name: loaded.name}, {
                alwaysEnabled: loaded.alwaysEnabled,
                defaultStatus: loaded.defaultState,
                hasCommands: loaded.hasCommands,
                pro: loaded.pro,
                private: loaded.private,
                friendlyName: loaded.friendlyName
            });
        }else{
            this.metadataModels.module.create({
                name: loaded.name,
                alwaysEnabled: loaded.alwaysEnabled,
                defaultStatus: loaded.defaultState,
                hasCommands: loaded.hasCommands,
                pro: loaded.pro,
                private: loaded.private,
                friendlyName: loaded.friendlyName
            });
        }
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
        mongoOptions.dbName = this.build + "3";
        
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
                    this.loadConfigManager(`${__dirname}/Managers/Config/` + file);
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

    metadataInit(): void {
        this.metadataModels = {} as {module: Model<Document & moduleMeta>; command: Model<Document & commandMeta>};
        this.metadataModels.module = model("moduleMetadata", moduleSchema);
        this.metadataModels.command = model("commandMetadata", commandSchema);
    }

    async initGlobal(): Promise<void> {
        this.globalModel = model("global", globalSchema);
        await this.loadGlobal();
    }

    async loadGlobal(): Promise<void> {
        const data = await this.globalModel.findOne({}).lean<GlobalType>().exec();
        if(data){
            this.global = data;
        }else{
            this.global = {
                globalCooldown: 1,
                disabledCommands: [],
                disabledLogEvents: [],
                disabledModules: [],
                guildBlacklist: [],
                userBlacklist: []
            };
        }
    }

    async reloadGlobal(): Promise<void> {
        const data = await this.globalModel.findOne({}).lean<GlobalType>().exec();
        if(!data){throw new Error("Could not load new global!");}
        this.global = data;
    }

    updateGlobal(): void {
        this.globalModel.updateOne({}, this.global).exec();
    }
}

//hi wuper

const globalSchema = new Schema({
    userBlacklist: {type: Array, default: []},
    guildBlacklist: {type: Array, default: []},
    disabledCommands: {type: Array, default: []},
    disabledModules: {type: Array, default: []},
    disabledLogEvents: {type: Array, default: []},
    globalCooldown: {type: Number, default: 1}
}, {minimize: false, autoIndex: true});

const moduleSchema = new Schema({
    name: {type: String, required: true, unique: true},
    alwaysEnabled: {type: Boolean, default: false},
    defaultStatus: {type: Boolean, default: true},
    hasCommands: {type: Boolean, default: false},
    pro: {type: Boolean, default: false},
    private: {type: Boolean, default: false},
    friendlyName: {type: String}
}, {minimize: false, autoIndex: true});

const commandSchema = new Schema({
    name: {type: String, required: true, unique: true},
    alwaysEnabled: {type: Boolean, default: false},
    aliases: {type: Array, default: []},
    perms: {type: String, default: ""},
    pro: {type: Boolean, default: false},
    private: {type: Boolean, default: false},
    cooldown: {type: Number, default: 2}
}, {minimize: false, autoIndex: true});

interface commandMeta {
    name: string;
    alwaysEnabled: boolean;
    aliases: Array<string>;
    perms: string;
    pro: boolean;
    private: boolean;
    cooldown: number;
}

interface moduleMeta {
    name: string;
    alwaysEnabled: boolean;
    defaultStatus: boolean;
    hasCommands: boolean;
    pro: boolean;
    private: boolean;
    friendlyName: string;
}

export interface GuildType {
    guild: string;
    prefix: string;
    modules: {[key: string]: boolean},
    commands: {[key: string]: {
        enabled: boolean;
        allowedRoles: Array<string>,
        allowedChannels: Array<string>,
        disabledRoles: Array<string>,
        disabledChannels: Array<string>,
        subcommands?: {[key: string]: {enabled: boolean}};
    }};
    pro: boolean;
    deleted: boolean;
    updatedAt: number;
    deletedAt: number;
    casulaPrefix: boolean;
    cantRunMessage: boolean;
    embedCommonResponses: boolean;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    ignoredUsers: Array<string>;
    dev: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;

    mod: {
        caseNumber: number;
        modRoles: Array<string>;
        protectedRoles: Array<string>;
        muteRole: string;
        manageMuteRole: boolean;
        modLogChannel: string;
        lockdownGroups: {[key: string]: Array<string>}
        dmOnBan: boolean;
        dmOnKick: boolean;
        dmOnMute: boolean;
        dmOnUmute: boolean;
        banLogChannel?: string;
        kickLogChannel?: string;
        muteLogChannel?: string;
        warnLogChannel?: string;
        lockLogChannel?: string;
        persistLogChannel?: string;
        logPersists: boolean;
    },
    lang: string;
}

export interface CommandContext<T = Module<unknown>> {
    msg: Message;
    channel: GuildTextableChannel;
    guild: Guild;
    command: Command;
    module: T;
    content: string;
    args: Array<string>;
    member: Member;
    dev: boolean;
    admin: boolean;
    acks: ack;
    config: GuildType;
    createMessage(input: AdvancedMessageContent): Promise<Message>;
    t(key: string, replace?: Array<string>): string;
}

export interface CommandResponse {
    status?: "success" | "error" | "info" | "fancySuccess"
    literal?: true;
    content: string | AdvancedMessageContent | null;
    success: boolean;
    showHelp?: true;
    self?: true;
    langMixins?: Array<string>;
}

export interface GlobalType {
    userBlacklist: Array<string>;
    guildBlacklist: Array<string>;
    disabledCommands: Array<string>;
    disabledModules: Array<string>;
    disabledLogEvents: Array<string>;
    globalCooldown: number;
}

export interface modLogType {
    mid: string;
    user: string;
    guild: string;
    mod: string;
    caseNumber: number;
    action: "ban" | "kick" | "softban" | "mute" | "unmute" | "unban" | "warn" | "persist" | "lock";
    time: number;
    length?: number;
    logChannel?: string;
    logPost?: string;
    hidden?: boolean;
    name: string;
    autoEnd: boolean;
    reason?: string;
}

export interface moderationType {
    mid: string;
    user: string;
    guild: string;
    action: "ban" | "kick" | "softban" | "mute" | "unmute" | "unban" | "warn" | "persist" | "lock";
    roles?: Array<string>;
    start: number;
    end?: number;
    duration?: number;
    channels?: Array<string>;
    failCount?: number;
}

export interface noteType {
    guild: string;
    user: string;
    mod: string;
    content: string;
    time: number;
    id: number;
}