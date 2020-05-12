import {Command} from "../../../Core/Structures/Command";
import {HyperionInterface, CommandContext} from "../../../types";
import { Embed } from "eris";
class Bean extends Command{
    constructor(){
        super({
            name: "bean",
            module: "fun",
            helpDetail: "Bean your friends!",
            helpUsage: "{prefix}bean [text]",
            helpUsageExample: "{prefix}bean @bean you got beaned!"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>}>{
        const data = {
            content: ctx.args.join(" "),
            embed: {
                title: "BEANED!!!",
                color: Hyperion.defaultColor,
                timestamp: new Date(),
                image: {
                    url: "https://cdn.discordapp.com/attachments/239446877953720321/333048272287432714/unknown.png"
                }
            }
        };
        
        return data;
    }
}
export default Bean;