import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";
import {default as msc} from "pretty-ms";
import { Embed } from "eris";

class Up extends Command{
    constructor(){
        super({
            name: "up",
            module: "info",
            aliases: ["uptime"],
            alwaysEnabled: true,

            helpDetail: "Shows uptime and some technical statistics",
            helpUsage: "{prefix}up",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>}>{
        const data = {
            embed: {
                title: "Hyperion Uptime",
                color: Hyperion.defaultColor,
                timestamp: new Date(),
                footer: {
                    text: `Hyperion | ${Hyperion.build} | ${Hyperion.version} | PID ${process.pid} | Cluster ${Hyperion.id} | Shard ${ctx.guild.shard.id}`
                },
                description: `**Process Uptime:** ${msc(process.uptime()*1000)}\n**Connection Uptime:** ${msc(Hyperion.client.uptime)}`
            }
        };
        return data;
    }
}
export default Up;