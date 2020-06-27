import {Command} from "../../../Core/Structures/Command";
import {default as os} from "os";
import {default as msc} from "pretty-ms";
// eslint-disable-next-line no-unused-vars
import {IHyperion, ICommandContext} from "../../../types";
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

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | string>{
        const totalGuilds = 0;
        const totalMem = 0;
        const totalUsers = 0;
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
                        value: `${totalGuilds !== 0 ? totalGuilds: "I havent been up long enough to show some stats"}`,
                        inline: true
                    },
                    {
                        name: "Lifetime Commands Used",
                        value: `${await Hyperion.redis.get("lcr")}`,
                        inline: true
                    },
                    {
                        name: "CPU Usage",
                        value: `${os.loadavg()[0].toFixed(2)}%`,
                        inline: true
                    },
                    {
                        name: "Users",
                        value: `${totalUsers !== 0 ? totalUsers: "I havent been up long enough to show some stats"}`,
                        inline: true
                    },
                    {
                        name: "Uptime",
                        value: `${msc(Hyperion.client.uptime)}`,
                        inline: true
                    },
                    {
                        name: "Modules",
                        value: `${Hyperion.modules.size}`,
                        inline: true
                    },
                    {
                        name: "RAM Usage",
                        value: `${totalMem !== 0 ? 0 : "I havent been up long enough to show some stats"}mb`,
                        inline: true
                    }

                ]
            }
        };
        return data;
    }
}
export default Stats;