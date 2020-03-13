const {Collection} = require('eris');
const cooldown = require("./Cooldown.js").struct;

class Command{
    constructor(){
        this.name = "dummy";
        this.id = this.name;
        this.module = "default";

        this.internal = false;
        this.alwaysEnabled = false;

        this.userperms = [];
        this.botperms = [];
        this.needsRolepos = false;

        this.cooldownTime = 2000;

        this.helpDetail = "dummy";
        this.helpUsage = "dummy";
        this.helpUsageExample = "dummy";
    }

    //dummy default command 
    async execute(){
        throw new Error("Unimplemented command!");
    }

}
exports.struct = Command;