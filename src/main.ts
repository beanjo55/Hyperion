import {Client, Collection} from 'eris';
import Eris from 'eris'
import {Module} from "./Core/Structures/Module.js";
import {Command} from "./Core/Structures/Command.js";
import {logger} from "./Core/Structures/Logger";
import fs = require("fs");
import mongoose = require('mongoose');
const config = require("../config.json");

import {CoreOptions, HyperionInterface} from "./types";

const user = require("./MongoDB/User.js").model;
const guild = require("./MongoDB/Guild.js").model;
const guilduser = require("./MongoDB/Guilduser.js").model;
const modlog = require("./MongoDB/Modlog.js").model;
const global = require("./MongoDB/Global.js").model;

const models = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global
};


class hyperion extends Client implements HyperionInterface{
    build: string;
    modules: Collection<Module>;
    sentry: any;
    commands: Collection<Command>;
    logger: any;
    bevents: any;
    devPrefix: string;
    modlist: Array<string>;
    version: string;
    adminPrefix: string;
    defaultColor: string;
    mongoOptions: mongoose.ConnectionOptions;
    models: any;
    db: mongoose.Connection;
    global: any;
    

    constructor(token: string, erisOptions: Eris.ClientOptions, coreOptions: CoreOptions, mongoLogin: string, mongoOptions: mongoose.ConnectionOptions){
        super(token, erisOptions);
        this.build = coreOptions.build;
        this.modules = new Collection(Module);
        this.commands = new Collection(Command);
        this.logger = logger;
        this.sentry = require('@sentry/node');
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

    }
    async init(){
        await this.loadMods();
        await this.loadEvents();
        this.global = await this.models.global.findOne({});
    }

    async loadEvent(eventfile: string){
        try{
            const Event = require(`./Events/${eventfile}`).event;
            this.bevents[Event.name] = Event.handle.bind(this);
            this.on(Event.name, this.bevents[Event.name]);
        }catch(err){
            this.logger.error("Hyperion", "Event Loading", `Failed to load event ${eventfile}, error: ${err}`);
        }
    }

    async loadEvents(){
        const eventfiles = fs.readdirSync(__dirname + "/Events");
        eventfiles.forEach(file => {
            this.loadEvent(file);
        })
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
                mod.loadCommands(this)
            }
        });
        
    }

    mongoDB(mongoLogin: string){
        this.mongoOptions.dbName = this.build;
        mongoose.connect(mongoLogin, this.mongoOptions);
        mongoose.connection.on('error', () => {
            this.logger.error("MongoDB", "Connection", "Failed to connect to MongoDB");
        });
        mongoose.connection.on('open', () => {
            this.logger.success("MongoDB", "Connection", "Connected to MongoDB");
        })
        return mongoose.connection
    }
}

const Hyperion = new hyperion(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);

Hyperion.init().then(() => {
    Hyperion.connect();
})