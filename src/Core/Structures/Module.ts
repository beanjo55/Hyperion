import {logger} from "./Logger";
const fs = require("fs");
import {HyperionInterface} from "../../types";


export class Module{
    name: string;
    id: string;
    private: boolean;
    alwaysEnabled: boolean;
    hasCommands: boolean;
    needsInit: boolean;
    needsLoad: boolean;
    cmdpath: string;
    modpath: string;
    default: Boolean;
    [key: string]: any
    

    constructor(data: any){
        this.name = data.name || "module";
        this.id = this.name;

        this.private = data.private || false;
        this.alwaysEnabled = data.alwaysEnabled || false;
        this.default = data.default;

        this.hasCommands = data.hasCommands || false;
        this.needsInit = data.needsInit || false;
        this.needsLoad = data.needsLoad || false;

        this.cmdpath = `${__dirname}/Commands`;
        this.modpath = `${__dirname}/Module`;

        
    }

    loadMod(){
        try{
            const modFiles = fs.readdirSync(this.modpath);
            modFiles.forEach((e: string) => {
                if(!e.startsWith(".")){
                    try{
                        let name = e.substring(0, e.length-3);
                        this[name] = require(`${this.modpath}/${e}`).modfile
                    }catch(err){
                        logger.error("Hyperion", "Load Mod", `Error laoding mod file ${e}, error: ${err}`)
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
                        const precmd = require(`${this.cmdpath}/${e}`).cmd;
                        let cmd = new precmd;
                        if(cmd.hasSub){
                            cmd.registerSubcommands();
                        }
                        Hyperion.commands.add(cmd);
                    }catch(err){
                        logger.error("Hyperion", "Load Commands", `Failed to load command ${e} from module ${this.name}. error: ${err}`);
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
    init(Hyperion: HyperionInterface){

    }
}
