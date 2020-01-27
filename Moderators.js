const {command} = require("../command.js");
const {resolveRole} = require("../util.js");


class Moderators extends command{
    constructor(){
        super();
        this.name = "moderators";
        this.id = this.name;
        this.commandType = "manager";
        this.requiredPerms = ["manageGuild"];
        this.helpInfo = "List, add, or remove moderator roles";
    }

    async execute(msg, args, Hyperion){

        if(args.length === 0){
            await this.list(msg, args, Hyperion);
            return;
        }

        switch(args[0].toLowerCase){
            case 'add':
                await this.add(msg, args, Hyperion);
                break;
            case 'remove':
                await this.remove(msg, args, Hyperion);
                break;
            case 'del':
                await this.remove(msg, args, Hyperion);
                break;
            case 'delete':
                await this.remove(msg, args, Hyperion);
                break;
            default:
                await this.list(msg, args, Hyperion);
        }
        return;


    }

    async list(msg, args, Hyperion){

    }

    async add(msg, args, Hyperion){

    }

    async remove(msg, args, Hyperion){

    }
}
exports.cmd = Moderators;