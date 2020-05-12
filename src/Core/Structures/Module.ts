import {logger} from "./Logger";
import {default as fs} from "fs";
import {HyperionInterface, ConfigOp, GuildConfig} from "../../types";
import {ConfigKey as configkey} from "../../types";
import {inspect} from "util";
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
                        logger.error("Hyperion", "Load Mod", `Error laoding mod file ${e}, error: ${err}`);
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", "Load Mod", `Error loading module files for module ${this.name}: ${err}`);
        }
    }

    

    loadCommands(Hyperion: HyperionInterface): void{
        try{
            const cmdFiles = fs.readdirSync(this.cmdpath);
            cmdFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        const precmd = require(`${this.cmdpath}/${e}`).default;
                        const cmd = new precmd;
                        if(cmd.hasSub){
                            const subcommands = require(`${this.cmdpath}/${e}`).subcmd;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    reloadCommands(Hyperion: HyperionInterface): void | undefined{
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


    //module setup, to be implemented by module
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    init(Hyperion: HyperionInterface): void{
        throw new Error("Init was expected, but not implemented");
    }

    async checkGuildEnabled(Hyperion: HyperionInterface, guildID: string): Promise<boolean>{
        if(Hyperion.global.gDisabledMods.includes(this.name)){return false;}
        const config: GuildConfig = await Hyperion.managers.guild.getConfig(guildID);
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
