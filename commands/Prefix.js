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
        let newPrefix = args[0];
        await Hyperion.guildModel.updateOne({ 'guildID': msg.channel.guild.id }, { 'prefix': newPrefix});
        msg.channel.createMessage(`Prefix changed to \`${args[0]}\``);
        return;
    }
}

exports.cmd = Prefix;