const { command } = require("../command.js");
const os = require("os");
const Embed = require("embedcord");
const msc = require("pretty-ms");



class Stats extends command{
    constructor(){
        super();
        this.name = "stats";
        this.id = this.name;
        this.commandType = "info";
        this.helpInfo = "Sends some system and bot stats";
    }

    async execute(msg, args, Hyperion){
        const embed = new Embed.DiscordEmbed()
        .setTitle("Hyperion stats")
        .setColor("#e87722")
        .setTimestamp()
        .addField("Guilds", `${Hyperion.guilds.size} Guilds`, true)
        .addField("Users", `${Hyperion.users.size} Users`, true)
        .addField("CPU Usage", `${os.loadavg()[0]}`, true)
        .addField("Memory Usage", `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} mb`, true)
        .addField("Uptime", `${msc(Hyperion.uptime)}`, true);
        msg.channel.createMessage(embed);
    }

    async diagnose(){

    }

    async sendHelp(){

    }
}
exports.cmd = Stats;