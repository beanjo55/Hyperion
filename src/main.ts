import {Base} from "./harbringer/index";
import {IPC} from "./harbringer/structures/IPC";
import {AdvancedMessageContent, Client, Guild, GuildTextableChannel, Member, Message, Collection, Embed} from "eris";
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
import {Module as V2Module} from "./V2/Structures/Module";
import {Command as V2Command} from "./V2/Structures/Command";
import {IUtils} from "./V2/types";
import utils from "./V2/Utils/index";
import {manager as MongoGuildManager} from "./V2/Structures/MongoGuildManager";
import {manager as MongoUserManager} from "./V2/Structures/MongoUserManager";
import {default as MongoGuilduserManager} from "./V2/Structures/MongoGuildUserManager";
import {manager as MongoModlogManager} from "./V2/Structures/MongoModLogManager";
import {default as MongoEmbedManager} from "./V2/Structures/MongoEmbedManager";
import {default as MongoModerationManager} from "./V2/Structures/MongoModerationManager";

const config = require("../config.json");
const version = require("../package.json").version as string;

export type events = "messageCreate";

class InternalEvents extends EventEmitter{
    Hyperion: hyperion;
    constructor(Hyperion: hyperion){
        super();
        this.Hyperion = Hyperion;
    }
}

export type roles = "guild" | "user" | "guilduser" | "embeds" | "tags" | "modlogs" | "moderations" | "stars" | "notes"
const emotes = {
    error: "<:error:732383200436813846>",
    neutral: "<:Neutral:680442866354749444>",
    success: "<:success:732383396432445470>",
    fancySuccess: "<a:fancyCheck:746181287592722472>",
    info: "<:info:747287441739612191>",
    happyKitty: "<a:happykitty:734450859026546699>"
};
const colors = {
    red: 15541248, 
    yellow: 16771072, 
    green: 65386, 
    orange: 15234850, 
    blue: 30719,
    default: config.coreOptions.defaultColor
};
export interface V2Type {
    modules: Collection<V2Module>;
    commands: Collection<V2Command>;
    utils: IUtils;
    client: Client;
    redis: IORedis.Redis;
    emotes: typeof emotes;
    colors: typeof colors;
    global: GlobalType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stars: any;
    sentry: typeof sentry;
    version: string;
    adminPrefix: string;
    devPrefix: string;
    logger: typeof logger;
    ipc: IPC;
    build: string;
    clusterID: number;
    managers: {
        guild: MongoGuildManager;
        user: MongoUserManager;
        guilduser: MongoGuilduserManager;
        modlog: MongoModlogManager;
        moderations: MongoModerationManager;
        embeds: MongoEmbedManager;
    };
}

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
    colors = colors;
    emotes = emotes;
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
    version = version;
    V2!: V2Type;
    circleCIToken = config.coreOptions.circleCIToken
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
        this.compatInit();
        this.name = this.client.user.username;
        this.trueReady = true;
        const cfgSweeper = function(this: hyperion): void {
            this.client.guilds.forEach((g)=> {
                const rg = g as Guild & {cfg?: GuildType, lastUsed?: number};
                if(rg.cfg){
                    if(rg.lastUsed! >= Date.now() + (900000)){
                        delete rg.cfg;
                        delete rg.lastUsed;
                    }
                }
            });
        };
        setInterval(cfgSweeper.bind(this), 60000);
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
            this.Hyperion.V2.modules.forEach(mod => {
                if(mod.subscribedEvents.includes(this.name)){(mod[this.name] as (...args: Array<unknown>) => void)(...args);}
            });
        }
        async function messageTemplate(this: {name: events; Hyperion: hyperion}, ...args: Array<unknown>){
            if(!this.Hyperion.trueReady){return;}
            const guild = ((args[0] as Message).channel as GuildTextableChannel).guild as Guild & {cfg: GuildType, lastUsed: number};
            if(!guild){return;}
            if(!guild.cfg){
                const config = await this.Hyperion.manager.guild().get(guild.id);
                guild.cfg = config;
            }
            guild.lastUsed = Date.now();
            this.Hyperion.modules.forEach(mod => {
                if(mod.subscribedEvents.includes(this.name)){(mod[this.name] as (...args: Array<unknown>) => void)(...args);}
            });
            this.Hyperion.V2.modules.forEach(mod => {
                if(mod.subscribedEvents.includes(this.name)){(mod[this.name] as (...args: Array<unknown>) => void)(...args);}
            });
        }
        this.client.on(name, name === "messageCreate" ? messageTemplate.bind(payload) : template.bind(payload));
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
                userBlacklist: [],
                exp: {
                    coeff: 0.1,
                    cooldown: 120,
                    offset: 0,
                    min: 10,
                    max: 15,
                    div: 2
                }
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

    compatInit(): void{
        this.V2 = {
            utils,
            client: this.client,
            redis: this.redis,
            colors: this.colors,
            emotes: this.emotes,
            global: this.global,
            stars: {},
            sentry: this.sentry,
            devPrefix: this.devPrefix,
            adminPrefix: this.adminPrefix,
            logger: this.logger,
            ipc: this.ipc,
            build: this.build,
            clusterID: this.clusterID,
            version,
            managers: {
                guild: new MongoGuildManager(this),
                user: new MongoUserManager(this),
                guilduser: new MongoGuilduserManager(this),
                modlog: new MongoModlogManager(this),
                moderations: new MongoModerationManager(this),
                embeds: new MongoEmbedManager(this)
            },
            modules: new Collection<V2Module>(V2Module),
            commands: new Collection<V2Command>(V2Command)
        } as V2Type;
        this.loadV2Mods();
    }

    loadV2Mod(modname: string): V2Module | undefined{
        try{
            const mod = require(`./V2/Modules/${modname}/${modname}.js`).default;
            return this.V2.modules.add(new mod(this.V2));
        }catch(err){
            this.logger.error("Hyperion", `Failed to load v2 module ${modname}, error: ${err}`, "Module Loading");
        }
    }

    loadV2Mods(): void{
        const modlist = ["CommandHandler", "Info", "Fun", "Social", "Manager", "Logging", "Mod", "Embeds", "Welcome", "Goodbye", "Quotes", "Highlights", "Reactionroles", "Levels", "VTL", "Suggestions"];
        modlist.forEach(mod =>{
            this.loadV2Mod(mod);
        });
        this.V2.modules.forEach(mod =>{
            if(mod.needsLoad){
                mod.loadMod();
            }
            if(mod.needsInit){
                mod.init(this.V2);
            }
            if(mod.hasCommands){
                mod.loadCommands();
            }
        });
        
    }

    redact(input: string): string {
        const tokenRx = new RegExp(config.token.split(" ")[1], "gmi");
        const circleRx = new RegExp(config.coreOptions.circleCIToken, "gmi");
        const mongoRx = new RegExp(config.mongoLogin, "gmi");
        return input.replace(tokenRx, "No").replace(circleRx, "No").replace(mongoRx, "No");
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

interface LogEvent {
    enabled: boolean;
    channel: string;
    ignoredRoles: Array<string>;
    ignoredChannels: Array<string>;
}

interface ReactionRole {
    channel: string;
    erMap: Map<string, string>;
    linkedMessages: Array<string>;
}

interface Quote {
    user: string;
    link: string;
    channel: string;
    content: string;
    image?: string;
}

export interface GuildType {
    guild: string;
    prefix: string;
    modules: {[key: string]: boolean | {enabled: boolean}},
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
    casualPrefix: boolean;
    cantRunMessage: boolean;
    embedCommonResponses: boolean;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    ignoredUsers: Array<string>;
    dev: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;

    new_mod: {
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
        banLogChannel: string;
        kickLogChannel: string;
        muteLogChannel: string;
        warnLogChannel: string;
        lockLogChannel: string;
        persistLogChannel: string;
        logPersists: boolean;
        protectWarns: boolean;
    },
    lang: string;

    //v2
    mod: {
        modRoles: Array<string>;
        protectedRoles: Array<string>;
        modLogChannel: string;
        requireReason: boolean;
        requireMuteTime: boolean;
        deleteOnBan: boolean;
        deleteCommand: boolean;
        lastCase: number;
        muteRole: string;
        dmOnBan: boolean;
        dmOnKick: boolean;
        dmOnMute: boolean;
        dmOnUnmute: boolean;
        banLogChannel: string;
        warnLogChannel: string;
        muteLogChannel: string;
        kickLogChannel: string;
        protectWarns: boolean;
        manageMuteRole: boolean;
    };
    starboard: {
        starChannel: string;
        ignoredChannels: Array<string>;
        ignoredRoles: Array<string>;
        selfStar: boolean;
        customStar: string;
        starCount: number;
    };
    logging: {
        logChannel: string;
        ghostReactTime: number;
        ignoredChannels: Array<string>;
        ignoredRoles: Array<string>;
        specifyChannels: boolean;
        newAccountAge: number;
        showAvatar: boolean;
        prevCasesOnJoin: boolean;
        alwaysShowAge: boolean;
        banAdd: LogEvent;
        banRemove: LogEvent;
        memberAdd: LogEvent;
        memberRemove: LogEvent;
        messageDelete: LogEvent;
        messageEdit: LogEvent;
        bulkDelete: LogEvent;
        roleAdd: LogEvent;
        roleUpdate: LogEvent;
        roleDelete: LogEvent;
        channelAdd: LogEvent;
        channelUpdate: LogEvent;
        channelDelete: LogEvent;
        memberRoleAdd: LogEvent;
        memberRoleUpdate: LogEvent;
        memberRoleRemove: LogEvent;
        memberNicknameChange: LogEvent;
        voiceJoin: LogEvent;
        voiceSwitch: LogEvent;
        voiceLeave: LogEvent;
        guildUpdate: LogEvent;
        webhookUpdate: LogEvent;
        ghostReact: LogEvent;
        channelPermsUpdate: LogEvent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [index: string]: any
    };
    welcome: {
        messageType: string;
        content: string | Embed;
        channel?: string;
        dm: boolean;
    };
    goodbye: {
        messageType: string;
        content: string | Embed;
        channel?: string;
        dm: boolean;
    };
    reactionRoles: {
        limitOne: boolean;
        limitOnePerGroup: boolean;
        rr: Map<string, ReactionRole>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rrGroups: any;
        rrMessages: Map<string, string>
    };
    quotes: {
        quoteLinks: boolean;
        //guildQuotes: Map<number, Quote>;
    };
    vtl: {
        joinAnnouncements: boolean;
        leaveAnnouncements: boolean;
        links: {[key: string]: string}
    };
    levels: {
        expRoles: {[key: number]: {role: string; global: boolean; exp: number}};
        lvlRoles: {[key: number]: {role: string; global: boolean}; [key: string]: {role: string; global: boolean}};
        lvlUpSetting: "none" | "current" | string;
    };
    suggestions: {
        lastSuggestion: number;
        suggestionChannel: string;
        suggestions: {[key: number]: {
            msg: string; 
            status: "none" | "accepted" | "denied" | "considered" | "custom"; 
            cStatus?: string; 
            suggestor: string; 
            description: string; 
            reason?: string;
            reviewer?: string;
        }};
        checkOtherSuggestions: boolean;
        denyChannel: string;
        approveChannel: string;
        considerChannel: string;
        anonReviews: boolean;
        [key: string]: string | boolean | number | {[key: number]: {
            msg: string; 
            status: "none" | "accepted" | "denied" | "considered" | "custom"; 
            cStatus?: string; 
            suggestor: string; 
            description: string; 
            reason?: string;
            reviewer?: string;
        }} 
    };
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
    exp: {
        coeff: number;
        offset: number;
        div: number;
        min: number;
        max: number;
        cooldown: number;
    }
}

export interface modLogType {
    mid: string;
    user: string;
    guild: string;
    moderator: string;
    caseNumber: number;
    moderationType: "ban" | "kick" | "softban" | "mute" | "unmute" | "unban" | "warn" | "persist" | "lock" | "unlock";
    timeGiven: number;
    duration?: number;
    logChannel?: string;
    logPost?: string;
    hidden?: boolean;
    name?: string;
    autoEnd: boolean;
    reason?: string;
    stringLength?: string;
    endTime?: number;
    expired?: boolean;
    auto: boolean;
    role?: string;
    removedRoles?: Array<string>;

}

export interface moderationType {
    mid: string;
    user: string;
    guild: string;
    action: "ban" | "mute" | "persist" | "lock";
    roles?: Array<string>;
    start: number;
    end?: number;
    duration?: number;
    channels?: Array<string>;
    failCount?: number;
    caseNum: number;
    untimed: boolean;
}

export interface noteType {
    guild: string;
    user: string;
    mod: string;
    content: string;
    time: number;
    id: number;
}

export interface GuilduserType {
    user: string;
    guild: string;
    level: number;
    exp: number;
    highlights: Array<string>
}

export interface UserType {
    user: string;
    rep: number;
    repGiven: number;
    money: number;
    level: number;
    exp: number;
    lastRepTime: number;
    lastDailyTime: number;
    bio?: string;
}

interface CEmbed {
    embed: Partial<Embed>;
    randoms: Array<string>;
    timestamp: boolean | number;
}
export interface EmbedType {
    guild: string;
    embeds: Map<string, CEmbed> | {[key: string]: CEmbed};
    limit: number;
}

export interface StarType {
    guild: string;
    channel: string;
    message: string;
    count: number;
    starPost?: string;
    starChannel?: string;
    origStars?: Array<string>;
    deleted?: true;
    locked?: true;
}

export interface CGuild extends Guild {
    cfg?: GuildType;
    lastUsed?: number;
}