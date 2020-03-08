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
        this.cooldowns = new Collection(cooldown);

        this.helpDetail = "dummy";
        this.helpUsage = "dummy";
        this.helpUsageExample = "dummy";
    }

    //dummy default command 
    async execute(){
        throw new Error("Unimplemented command!");
    }

    //adds a cooldown
    addCooldown(user){
        this.cooldowns.add(new cooldown({
            id: user.id
        }));
    }

    //checks if the user is under a cooldown and if the command should run
    //returns true for can run, false for cannot run
    checkCooldown(user){
        const cool = this.cooldowns.get(user.id);
        if(!cool){
            return true;
        }
        if((Date.now() - cool.time) > this.cooldownTime){
            this.cooldowns.remove(user.id);
            return true;
        }
        return false;
    }
}
exports.struct = Command;