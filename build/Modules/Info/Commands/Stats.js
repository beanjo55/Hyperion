"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../Core/Structures/Command");
const os = require("os");
const msc = require("pretty-ms");
class Stats extends Command_1.Command {
    constructor() {
        super({
            name: "stats",
            module: "info",
            alwaysEnabled: true,
        });
    }
    async execute(ctx, Hyperion) {
        let data = {
            embed: {
                title: "Hyperion Stats",
                color: Hyperion.defaultColor,
                timestamp: new Date(),
                fields: [
                    {
                        name: "Version",
                        value: `${Hyperion.version}`,
                        inline: true
                    },
                    {
                        name: "Commands",
                        value: `${Hyperion.commands.size}`,
                        inline: true
                    },
                    {
                        name: "Guilds",
                        value: `${Hyperion.client.guilds.size}`,
                        inline: true
                    },
                    {
                        name: "Users",
                        value: `${Hyperion.client.users.size}`,
                        inline: true
                    },
                    {
                        name: "Uptime",
                        value: `${msc(Hyperion.client.uptime)}`,
                        inline: true
                    },
                    {
                        name: "CPU Usage",
                        value: `${os.loadavg()[0].toFixed(2)}%`,
                        inline: true
                    },
                    {
                        name: "RAM Usage",
                        value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb`,
                        inline: true
                    }
                ]
            }
        };
        return { status: { code: 0 }, payload: data };
    }
}
exports.default = Stats;
