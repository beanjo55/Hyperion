const {command} = require("../command.js");

class Deactivate extends command{
    constructor(){
        super();
        this.name = "deactivate";
        this.id = this.name;
        this.commandType = "internal";
        this.requiredUsers = ["253233185800847361"];
    }

    async execute(msg, args, Hyperion){
        const registration = await Hyperion.models.premium.exists({guildId: args[0]});
        if(!registration){
            return msg.channel.createMessage("Thats guild has never been registered, or the entered guild was invalid");
        }

        await Hyperion.models.premium.updateOne({guildId: args[0]}, {activated: false});
        return msg.channel.createMessage(`Guild ${args[0]} has been deactivated`);
    }
}
exports.cmd = Deactivate;