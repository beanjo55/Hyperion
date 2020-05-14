import {Command} from "../../../Core/Structures/Command";
import {default as os} from "os";
import {default as msc} from "pretty-ms";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext, IPCResult, HyperionStats} from "../../../types";
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

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>} | string>{
        let totalGuilds = 0;
        let totalMem = 0;
        let totalUsers = 0;
        const fstats: IPCResult = (await Hyperion.ipc.getStats() as IPCResult);
        if(!fstats?.success){
            return "There was an error fetching stats";
        }

        const stats: HyperionStats = (fstats.d as HyperionStats);
        const clusters = Object.getOwnPropertyNames(stats.clusters);
        if(clusters.length !== 0){
            totalMem += stats.manager.memory.rss/1024/1024;
            clusters.forEach((c: string) => {
            
                totalMem += stats.clusters[Number(c)].memory.rss/1024/1024;
                totalGuilds += stats.clusters[Number(c)]?.discord?.guilds ?? 0;
                totalUsers += stats.clusters[Number(c)]?.discord?.users ?? 0;
            });
        }

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
                        value: `${totalMem !== 0 ? totalMem.toFixed(2): "I havent been up long enough to show some stats"}mb`,
                        inline: true
                    }

                ]
            }
        };
        return data;
    }
}
export default Stats;