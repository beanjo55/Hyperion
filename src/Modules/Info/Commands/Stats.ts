import {Command} from "../../../Core/Structures/Command";
import {default as os} from "os";
import {default as msc} from "pretty-ms";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";
import { Embed } from "eris";

class Stats extends Command{
    constructor(){
        super({
            name: "stats",
            module: "info",
            alwaysEnabled: true,

            helpDetail: "Shows some bot stats",
            helpUsage: "{prefix}stats",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>}>{
        const data = {
            embed:{
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
                        value: `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}mb`,
                        inline: true
                    },
                    {
                        name: "Lifetime Commands Used",
                        value: `${await Hyperion.redis.get("lcr")}`,
                        inline: true
                    }
                ]
            }
        };
        return data;
    }
}
export default Stats;