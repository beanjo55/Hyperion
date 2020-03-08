const logger = require('./Logger.js').struct;
const fs = require("fs");


class Module{
    constructor(){
        this.name = "module";
        this.id = this.name;

        this.private = false;
        this.alwaysEnabled = false;

        this.hasCommands = false;
        this.needsInit = false;

        this.modpath = `${__dirname}/Module`;
        this.cmdpath = `${__dirname}/Commands`;

        this.mod = {};
        
    }

    loadMod(){
        try{
            const modFiles = fs.readdirSync(this.modPath);
            modFiles.forEach(e => {
                let name = e.substring(0, e.length-3);
                this.mod[name] = require(`${this.modPath}/${e}`).modfile;
            });
        }catch(err){
            logger.error("Hyperion", "Load Mod", `Error loading module files for module ${this.name}: ${err}`);
        }
    }

    reloadMod(){
        this.mod = {};
        this.loadMod();
    }

    loadCommands(Hyperion){
        if(!this.hasCmds){
            return;
        }
        try{
            const cmdFiles = fs.readdirSync(this.cmdPath);
            cmdFiles.forEach(e => {
                const {cmd} = require(`${this.cmdPath}/${e}`).modfile;
                Hyperion.commands.add(cmd)
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