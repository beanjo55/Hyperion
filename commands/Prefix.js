const { command } = require("../command.js");


class Prefix extends command{
    constructor(){
        super();
        this.name = "prefix";
        this.id = this.name;
        this.alwaysEnabled = true;
        this.helpInfo = "Changes the server prefix";

        this.requiredPerms = ["manageGuild"];
        this.commandType = "manager";
    }
    async execute(msg, args, Hyperion){
        if(args.length === 0){
            const aprefix = await Hyperion.guildModel.findOne({'guildID': msg.channel.guild.id}, 'prefix').exec();
            let prefix = aprefix.prefix[0];
            msg.channel.createMessage(`the prefix is \`${prefix}\``);
            return;
        }
        let newPrefix = args[0];
        await Hyperion.guildModel.updateOne({ 'guildID': msg.channel.guild.id }, { 'prefix': newPrefix});
        msg.channel.createMessage(`Prefix changed to \`${args[0]}\``);
        return;
    }
}

exports.cmd = Prefix;