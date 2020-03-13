const logger = require('./Logger.js').struct;
const fs = require("fs");


class Module{
    constructor(data){
        this.name = data.name || "module";
        this.id = this.name;

        this.private = data.private || false;
        this.alwaysEnabled = data.alwaysEnabled || false;

        this.hasCommands = data.hasCommands || false;
        this.needsInit = data.needsInit || false;

        this.modpath = `${__dirname}/Module`;
        this.cmdpath = `${__dirname}/Commands`;

        
    }

    loadMod(){
        try{
            const modFiles = fs.readdirSync(this.modPath);
            modFiles.forEach(e => {
                if(!e.startsWith(".")){
                    try{
                        let name = e.substring(0, e.length-3);
                        this[name] = require(`${this.modPath}/${e}`).modfile
                    }catch(err){
                        logger.error("Hyperion", "Load Mod", `Error laoding mod file ${e}, error: ${err}`)
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", "Load Mod", `Error loading module files for module ${this.name}: ${err}`);
        }
    }

    

    loadCommands(Hyperion){
        if(!this.hasCmds){
            return;
        }
        try{
            const cmdFiles = fs.readdirSync(this.cmdPath);
            cmdFiles.forEach(e => {
                if(!e.startsWith(".")){
                    try{
                        const cmd = require(`${this.cmdPath}/${e}`).cmd;
                        Hyperion.commands.add(new cmd);
                    }catch(err){
                        logger.error("Hyperion", "Load Commands", `Failed to load command ${e} from module ${this.name}. error: ${err}`);
                    }
                }
            });
        }catch(err){
            logger.error("Hyperion", "Load Commands", `Error loading commands for module ${this.name}: ${err}`);
        }
    }

    reloadCommands(Hyperion){
        if(!this.hasCommands){
            return;
        }

        const moduleCommands = Hyperion.commands.filter(c => c.module === this.name);

        moduleCommands.forEach(cmd => {
            Hyperion.commands.remove(cmd.id);
        });

        this.loadCommands(Hyperion);

    }


    //module setup, to be implemented by module
    init(){

    }
}
exports.struct = Module;