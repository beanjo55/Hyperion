import {Command} from "../../../Core/Structures/Command";
import {HyperionInterface, CommandContext, IPCResult, HyperionStats} from "../../../types";
import { Embed } from "eris";

class Devstats extends Command{
    constructor(){
        super({
            name: "devstats",
            module: "dev",
            dev: true,
            alwaysEnabled: true,

            helpDetail: "shows stats per cluster",
            helpUsage: "{prefix}devstats",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        const fstats: IPCResult = (await Hyperion.ipc.getStats() as IPCResult);
        if(!fstats?.success){
            return "There was an error fetching stats";
        }

        const stats: HyperionStats = (fstats.d as HyperionStats);
        const clusters = Object.getOwnPropertyNames(stats.clusters);
        const services = Object.getOwnPropertyNames(stats.services);
        const fields: Array<{name: string; value: string; inline: boolean}> = [];
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Developer Stats",
                color: Hyperion.defaultColor,
                timestamp: new Date,
                fields: fields
            }
        };

        data.embed.fields?.push({
            name: "Master",
            value: `\`\`\`xl\nMemory: ${(stats.manager.memory.rss/1024/1024).toFixed(2)} mb\`\`\``,
            inline: false
        });
        if(clusters.length !== 0){
            clusters.forEach((c: string) => {
                const cluster = stats.clusters[Number(c)];
                data.embed.fields?.push({
                    name: `Cluster ${c}`,
                    value: `\`\`\`xl\nMemory: ${(cluster.memory.rss/1024/1024).toFixed(2)} mb\nGuilds: ${cluster.discord?.guilds}\nUsers: ${cluster.discord?.users}\nShard Count: ${cluster.discord?.latencies.length}\`\`\``,
                    inline: false
                });
            });
        }




        return data;
    }
}
export default Devstats;