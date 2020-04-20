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

import mongoose = require("mongoose");
const config = require("../config.json");

import {CoreOptions, HyperionInterface} from "./types";

import {default as guild} from "./MongoDB/Guild";
import {default as user} from "./MongoDB/User";
import {default as guilduser} from "./MongoDB/Guilduser";
import {default as modlog} from "./MongoDB/Modlog";
import {default as global} from "./MongoDB/Global";
import {default as starModel} from "./MongoDB/Starred";
import {manager as MGM} from "./Core/DataManagers/MongoGuildManager";
import {manager as MUM} from "./Core/DataManagers/MongoUserManager";
import {hur as HoistUserResolver} from "./Core/Utils/Resolvers";

const models = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global,
    starred: starModel
};


class hyperion implements HyperionInterface{
    client: Eris.Client;
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
    defaultColor: number;
    mongoOptions: mongoose.ConnectionOptions;
    models: any;
    db: mongoose.Connection;
    global: any;
    logLevel: number
    managers: any;
    stars: any;
    utils: any;
    circleCIToken: string;

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
        this.version = coreOptions.version;
        this.logLevel = coreOptions.defaultLogLevel;
        this.managers = {guild: new MGM, user: new MUM};
        this.stars = {};
        this.circleCIToken = coreOptions.circleCIToken;
        this.utils = {hoistResolver: HoistUserResolver};

    }
    async init(){
        await this.loadMods();
        await this.loadEvents();
        this.global = await this.models.global.findOne({}).lean().exec();
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
}


async function start(){
    const Hyperion = new hyperion(config.token, config.erisOptions, config.coreOptions, config.mongoLogin, config.mongoOptions);
    Hyperion.init().then(() => {
        Hyperion.client.connect();
    });
}