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
        if(!Hyperion.guilds.find(g => g.id === guildid)){
            return msg.channel.send("Invalid or unrecognized guild ID entered");
        }

        //make sure user is valid
        const userid = args[1];
        try{
            const usr = Hyperion.getRESTUser(userid)
        }
        catch(err){
            return msg.channel.createMessage("Invalid user entered");
        }

        //check if the guild has already activated or has been registered at some point
        const registered = await Hyperion.models.premium.exists({guildID: guildid});
        if(registered){
            const registration = await Hyperion.models.premium.findOne({'guildID': guildid}, 'activated').exec();
            
        }
    }
}
exports.cmd = activate;