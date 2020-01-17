const { command } = require("../command.js");


class Prefix extends command{
    constructor(){
        super();
        this.name = "prefix";
        this.id = this.name;
        this.alwaysEnabled = true;
        this.helpInfo = "Changes the server prefix";

        this.requiredPerms = ["manageGuild"];
    }
    async execute(msg, args, Hyperion){
        Hyperion.guildModel.updateOne({ 'guildID': msg.channel.guild.id }, { 'prefix': args[0].toString()});
        msg.channel.createMessage(`Prefix changed to \`${args[0]}\``);
        return;
    }
}
exports.cmd = Prefix;