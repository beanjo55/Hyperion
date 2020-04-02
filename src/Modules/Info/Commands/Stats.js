const command = require('../../../Core/Structures/Command.js').Command;
const os = require("os");
const msc = require("pretty-ms");

class Stats extends command{
    constructor(){
        super();
        this.name = "stats";
        this.id = this.name;
        this.module = "Info";
        this.alwaysEnabled = true;
    }

    async execute(ctx){
        let data = {
            embed:{
                title: "Hyperion Stats",
                color: ctx.Hyperion.defaultColor,
                timestamp: new Date(),
                fields: [
                    {
                        name: "Version",
                        value: `${ctx.Hyperion.version}`,
                        inline: true
                    },
                    {
                        name: "Commands",
                        value: `${ctx.Hyperion.commands.size}`,
                        inline: true
                    },
                    {
                        name: "Guilds",
                        value: `${ctx.Hyperion.client.guilds.size}`,
                        inline: true
                    },
                    {
                        name: "Users",
                        value: `${ctx.Hyperion.client.users.size}`,
                        inline: true
                    },
                    {
                        name: "Uptime",
                        value: `${msc(ctx.Hyperion.client.uptime)}`,
                        inline: true
                    },
                    {
                        name: "CPU Usage",
                        value: `${os.loadavg()[0].toFixed(2)}%`,
                        inline: true
                    },
                    {
                        name: "RAM Usage",
                        value: `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}mb`,
                        inline: true
                    }
                ]
            }
        }
        return {status: {code: 0}, payload: data}
    }
}
exports.cmd = Stats;