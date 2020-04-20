import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../../types";
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

    // eslint-disable-next-line no-unused-vars
    async execute(ctx: any, Hyperion: HyperionInterface){
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