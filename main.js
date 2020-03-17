const Client = require('eris').Client;
const Collection = require('eris').Collection;
const Module = require("./Core/Structures/Module.js").struct;
const command = require("./Core/Structures/Command.js").struct;
const logger = require("./Core/Structures/Logger.js").struct;
const fs = require("fs");
const mongoose = require('mongoose');
const config = require("./config.json");

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











class hyperion extends Client{
    constructor(token, erisOptions, coreOptions, mongoLogin, mongoOptions){
        super(token, erisOptions);
        this.build = coreOptions.build;
        this.modules = new Collection(Module);
        this.commands = new Collection(command);
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

    async loadEvent(eventfile){
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

    async loadMod(modname){
        try{
            const mod = require(`./Modules/${modname}/${modname}.js`).module;
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

    async mongoDB(mongoLogin){
        this.mongoOptions.dbName = this.build;
        mongoose.connect(mongoLogin, this.mongoOptions);
        this.db = mongoose.connection;
        this.db.on('error', () => {
            this.logger.error("MongoDB", "Connection", "Failed to connect to MongoDB");
        });
        this.db.on('open', () => {
            this.logger.success("MongoDB", "Connection", "Connected to MongoDB");
        })
    }
}

const Hyperion = new hyperion(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);

Hyperion.init().then(() => {
    Hyperion.connect();
})