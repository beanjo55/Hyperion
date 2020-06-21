import {logger} from "./Logger";
import {default as fs} from "fs";
import {IHyperion, ConfigOp} from "../../types";
import {ConfigKey as configkey} from "../../types";
import {inspect} from "util";
import {Collection} from "eris";
import { IGuild } from "../../MongoDB/Guild";


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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    loadKeys(): void{
        throw new Error("Module expected config keys, but they werent implemented!");
    }

    loadMod(): void{
        try{
            const modFiles = fs.readdirSync(this.modpath);
            modFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        const name = e.substring(0, e.length-3);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let modfile: any = require(`${this.modpath}/${e}`).modfile;
                        if(modfile === undefined){
                            modfile = require(`${this.modpath}/${e}`).default;
                        }
                        this[name] = modfile;
                    }catch(err){
                        logger.error("Hyperion", `Error laoding mod file ${e}, error: ${err}`, "Load Mod");
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", `Error loading module files for module ${this.name}: ${err}`, "Load Mod");
        }
    }

    

    loadCommands(Hyperion: IHyperion): void{
        try{
            const cmdFiles = fs.readdirSync(this.cmdpath);
            cmdFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        this.loadCommand(Hyperion, e);
                    // eslint-disable-next-line no-empty
                    }catch{}
                }
            });
        }catch(err){
            logger.error("Hyperion", `Error loading commands for module ${this.name}: ${err}`, "Load Commands");
        }
    }

    loadCommand(Hyperion: IHyperion, commandFile: string): void{
        try{
            const precmd = require(`${this.cmdpath}/${commandFile}`).default;
            const cmd = new precmd;
            if(cmd.hasSub){
                const subcommands = require(`${this.cmdpath}/${commandFile}`).subcmd;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                subcommands.forEach((scmd: any) => {
                    cmd.subcommands.add(new scmd);
                });
            }
            Hyperion.commands.add(cmd);
        }catch(err){
            logger.error("Hyperion", `Failed to load command ${commandFile} from module ${this.name}. error: ${inspect(err)}`, "Load Commands");
            throw err;
        }
    }

    reloadCommands(Hyperion: IHyperion): void | undefined{
        if(!this.hasCommands){
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const moduleCommands = Hyperion.commands.filter((c: any) => c.module === this.name);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moduleCommands.forEach((cmd: any) => {
            Hyperion.commands.remove(cmd.id);
        });

        this.loadCommands(Hyperion);
    }

    reloadCommand(Hyperion: IHyperion, commandName: string): void{
        const filename = commandName.charAt(0).toUpperCase() + commandName.slice(1) + ".js";
        console.log(filename);
        try{
            const cmdFiles = fs.readdirSync(this.cmdpath);
            for(const file of cmdFiles){
                console.log(file);
                if(file !== filename){continue;}
                console.log("reloading command from" + file);
                delete require.cache[require.resolve(`${this.cmdpath}/${file}`)];
                console.log("cache cleared");
                Hyperion.commands.delete(commandName);
                console.log("command removed");
                this.loadCommand(Hyperion, filename);
            }
        }catch(err){
            Hyperion.logger.error("Hyperion", `Failed to reload command ${commandName}, error: ${err}`, "Command Reload");
            throw err;
        }
    }


    //module setup, to be implemented by module
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    init(Hyperion: IHyperion): void{
        throw new Error("Init was expected, but not implemented");
    }

    async checkGuildEnabled(Hyperion: IHyperion, guildID: string): Promise<boolean>{
        if(Hyperion.global.gDisabledMods.includes(this.name)){return false;}
        const config: IGuild | null = await Hyperion.managers.guild.getConfig(guildID);
        if(!config){return this.defualtState;}
        if(!config.modules){return this.defualtState;}
        if(!config.modules[this.name]){return this.defaultState;}
        if(config.modules[this.name].enabled !== undefined){return config.modules[this.name].enabled;}
        return this.defaultState;
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
    default: unknown;
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
