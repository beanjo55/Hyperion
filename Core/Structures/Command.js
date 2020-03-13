const {Collection} = require('eris');

class Command{
    constructor(){
        this.name = "dummy";
        this.id = this.name;
        this.module = "default";
        this.aliases = [];

        this.internal = false;
        this.alwaysEnabled = false;

        this.userperms = [];
        this.botperms = [];
        this.needsRolepos = false;

        this.cooldownTime = 2000;

        this.helpDetail = "dummy";
        this.helpUsage = "dummy";
        this.helpUsageExample = "dummy";

        this.subcommands = new Collection(Command)
    }

    //dummy default command 
    async execute(){
        throw new Error("Unimplemented command!");
    }

}
exports.struct = Command;