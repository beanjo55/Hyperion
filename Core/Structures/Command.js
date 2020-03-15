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

        this.dev = false;
        this.admin = false;
        this.support = false;

        this.cooldownTime = 2000;

        this.helpDetail = "dummy";
        this.helpUsage = "dummy";
        this.helpUsageExample = "dummy";

        this.hasSub = false;

        this.selfResponse = false;
        this.subcommandslist = [];
        this.subcommands = undefined;
    }

    async registerSubcommands(){
        this.subcommands = new Collection(Command);
        if(this.subcommandslist.length > 0){
            this.subcommandslist.forEach(cmd =>{
                this.subcommands.add(new cmd);
            })
        }
    }

    //dummy default command 
    async execute(){
        throw new Error("Unimplemented command!");
    }

}
exports.struct = Command;