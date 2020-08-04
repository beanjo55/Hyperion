import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, EmbedResponse} from "../../../types";



class Jumbo extends Command{
    constructor(){
        super({
            name: "jumbo",
            module: "fun",
            aliases: ["enlarge"],
            helpDetail: "Shows an emote in large size!",
            helpUsage: "{prefix}jumbo [emote]"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | EmbedResponse>{
        // eslint-disable-next-line no-useless-escape
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        if(!ctx.args[0]){return "You need to give me an emote to enlarge!";}
        const result = EmoteRegex.exec(ctx.args[0]);
        if(!result){return "Thats not an emote or I dont understand it";}
        const link =  `https://cdn.discordapp.com/emojis/${result[3]}${result[1] ? ".gif" : ".png"}?v=1`;
        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.default,
                timestamp: new Date,
                title: `Jumbo ${result[2]}!`,
                image: {
                    url: link
                }
            }
        };
        console.log(data);
        return data;
    }
}
export default Jumbo;