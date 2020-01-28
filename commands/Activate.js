const {command} = require("../command.js");

class activate extends command{
    constructor(){
        super();
        this.name = "activate";
        this.id = this.name;
        this.requiredUsers = ["253233185800847361"];
        this.commandType = "internal";
    }
    async execute(msg, args, Hyperion){

        //make sure guild is valid
        const guildid = args[0];
        const exists = Hyperion.models.guild.exists({guildID: guildid});
        if(!exists){
            return msg.channel.createMessage("Guild has not been registered, please invite the bot once then try again");
        }

        //make sure user is valid
        const userid = args[1];
        let usr = undefined;
        try{
            usr = await Hyperion.getRESTUser(userid)
        }
        catch(err){
            return msg.channel.createMessage("Invalid user entered");
        }

        //check if the guild has already activated or has been registered at some point
        const registered = await Hyperion.models.premium.exists({guildId: guildid});
        if(registered){
            const registration = await Hyperion.models.premium.findOne({'guildId': guildid}, 'activated').exec();

            if(registration.activated){
                return msg.channel.createMessage("Guild has already been activated");
            }else{
                Hyperion.models.premium.updateOne({ 'guildId': guildid}, {'activated': true, 'activator': userid});
                msg.channel.createMessage(`Activated ${Hyperion.user.username} on guild ${args[0]} for ${usr.username}`)
            }
            
        }else{
            return msg.channel.createMessage("Guild has not been registered, please invite the bot once then try again");
        }
    }
}
exports.cmd = activate;