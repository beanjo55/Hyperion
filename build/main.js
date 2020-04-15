"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const eris_1 = require("eris");
const Module_js_1 = require("./Core/Structures/Module.js");
const Command_js_1 = require("./Core/Structures/Command.js");
const Logger_1 = require("./Core/Structures/Logger");
const fs = require("fs");
const mongoose = require("mongoose");
const config = require("../config.json");
const Guild_1 = __importDefault(require("./MongoDB/Guild"));
const User_1 = __importDefault(require("./MongoDB/User"));
const Guilduser_1 = __importDefault(require("./MongoDB/Guilduser"));
const Modlog_1 = __importDefault(require("./MongoDB/Modlog"));
const Global_1 = __importDefault(require("./MongoDB/Global"));
const MongoGuildManager_1 = require("./Core/DataManagers/MongoGuildManager");
const models = {
    user: User_1.default,
    guild: Guild_1.default,
    guilduser: Guilduser_1.default,
    modlog: Modlog_1.default,
    global: Global_1.default
};
class hyperion {
    constructor(token, erisOptions, coreOptions, mongoLogin, mongoOptions) {
        this.client = new eris_1.Client(token, erisOptions);
        this.build = coreOptions.build;
        this.modules = new eris_1.Collection(Module_js_1.Module);
        this.commands = new eris_1.Collection(Command_js_1.Command);
        this.logger = Logger_1.logger;
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
        this.version = coreOptions.version;
        this.logLevel = coreOptions.defaultLogLevel;
        this.managers = { guild: new MongoGuildManager_1.manager };
        this.stars = {};
    }
    async init() {
        await this.loadMods();
        await this.loadEvents();
        this.global = await this.models.global.findOne({}).lean().exec();
    }
    async loadEvent(eventfile) {
        try {
            const Event = require(`./Events/${eventfile}`).event;
            this.bevents[Event.name] = Event.handle.bind(this);
            this.client.on(Event.name, this.bevents[Event.name]);
        }
        catch (err) {
            this.logger.error("Hyperion", "Event Loading", `Failed to load event ${eventfile}, error: ${err}`);
        }
    }
    async loadEvents() {
        const eventfiles = fs.readdirSync(__dirname + "/Events");
        eventfiles.forEach(file => {
            this.loadEvent(file);
        });
    }
    async reloadEvent() {
    }
    async loadMod(modname) {
        try {
            const mod = require(`./Modules/${modname}/${modname}.js`).default;
            this.modules.add(new mod);
        }
        catch (err) {
            this.logger.error("Hyperion", "Module Loading", `Failed to load module ${modname}, error: ${err}`);
        }
    }
    async loadMods() {
        this.modlist.forEach(mod => {
            this.loadMod(mod);
        });
        this.modules.forEach(mod => {
            if (mod.needsLoad) {
                mod.loadMod();
            }
            if (mod.needsInit) {
                mod.init(this);
            }
            if (mod.hasCommands) {
                mod.loadCommands(this);
            }
        });
    }
    mongoDB(mongoLogin) {
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
}
const Hyperion = new hyperion(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);
Hyperion.init().then(() => {
    Hyperion.client.connect();
});
