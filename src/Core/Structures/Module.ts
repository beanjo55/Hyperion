import {logger} from "./Logger";
const fs = require("fs");
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, ConfigOp} from "../../types";
// eslint-disable-next-line no-unused-vars
import {ConfigKey as configkey} from "../../types";
const { inspect } = require("util");
// eslint-disable-next-line no-unused-vars
import {Command} from "./Command";
// eslint-disable-next-line no-unused-vars
import {Collection} from "eris";


export class Module{
    name: string;
    friendlyName: string;
    id: string;
    private: boolean;
    alwaysEnabled: boolean;
    hasCommands: boolean;
    needsInit: boolean;
    cmdpath: string;
    defaultStatus: boolean;
    hasCfg: boolean;
    subscribedEvents: Array<string>;
    configKeys?: Collection<configkey>;

    //legacy module system
    needsLoad: boolean;
    modpath: string;
    [key: string]: any;
    

    constructor(data: any){
        this.name = data.name ?? "module";
        this.friendlyName = data.friendlyName ?? this.name;
        this.id = this.name;

        this.private = data.private ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;
        this.defaultStatus = data.defaultStatus ?? true;
        this.hasCfg = data.hasCfg ?? false;

        this.hasCommands = data.hasCommands ?? false;
        this.needsInit = data.needsInit ?? false;

        //legacy, moving to modules being self contained in the module class
        this.needsLoad = data.needsLoad ?? false;
        this.modpath = `${data.dirname}/Module`;


        this.cmdpath = `${data.dirname}/Commands`;
        this.subscribedEvents = data.subscribedEvents ?? [];
        if(data.configKeys){
            this.configKeys = data.configKeys;
        }

        
    }

    loadKeys(){
        throw new Error("Module expected config keys, but they werent implemented!");
    }

    loadMod(){
        try{
            const modFiles = fs.readdirSync(this.modpath);
            modFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        let name = e.substring(0, e.length-3);
                        let modfile: any = require(`${this.modpath}/${e}`).modfile;
                        if(modfile === undefined){
                            modfile = require(`${this.modpath}/${e}`).default;
                        }
                        this[name] = modfile;
                    }catch(err){
                        logger.error("Hyperion", "Load Mod", `Error laoding mod file ${e}, error: ${err}`);
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", "Load Mod", `Error loading module files for module ${this.name}: ${err}`);
        }
    }

    

    loadCommands(Hyperion: HyperionInterface){
        try{
            const cmdFiles = fs.readdirSync(this.cmdpath);
            cmdFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        const precmd = require(`${this.cmdpath}/${e}`).default;
                        let cmd = new precmd;
                        if(cmd.hasSub){
                            const subcommands = require(`${this.cmdpath}/${e}`).subcmd;
                            subcommands.forEach((scmd: any) => {
                                cmd.subcommands.add(new scmd);
                            });
                        }
                        Hyperion.commands.add(cmd);
                    }catch(err){
                        logger.error("Hyperion", "Load Commands", `Failed to load command ${e} from module ${this.name}. error: ${inspect(err)}`);
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", "Load Commands", `Error loading commands for module ${this.name}: ${err}`);
        }
    }

    reloadCommands(Hyperion: HyperionInterface){
        if(!this.hasCommands){
            return;
        }

        const moduleCommands = Hyperion.commands.filter((c: any) => c.module === this.name);

        moduleCommands.forEach((cmd: any) => {
            Hyperion.commands.remove(cmd.id);
        });

        this.loadCommands(Hyperion);

    }


    //module setup, to be implemented by module
    // eslint-disable-next-line no-unused-vars
    init(Hyperion: HyperionInterface){

    }
}

export class ConfigKey implements configkey{
    parent: string;
    id: string;
    ops: Array<ConfigOp>;
    description: string;
    friendlyName: string;
    dataType: string;
    array: boolean;
    default: any;
    constructor(data: Partial<configkey>){
        this.parent = data.parent ?? "dummy";
        this.id = data.id ?? "dummy";
        this.ops = data.ops ?? [0];
        this.description = data.description ?? "dummy";
        this.friendlyName = data.friendlyName ?? "dummy";
        this.dataType = data.dataType ?? "string";
        this.array = data.array ?? false;
        this.default = data.default;
    }
}
