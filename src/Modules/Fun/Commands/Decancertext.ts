import {Command} from "../../../Core/Structures/Command";
import {CommandResponse, EmbedResponse, ICommandContext, IHyperion} from "../../../types";
import {default as limax} from "limax";
import {default as unorm} from "unorm";

class Decancertext extends Command{
    constructor(){
        super({
            name: "decancertext",
            module: "fun",
            helpDetail: "Decancers text input.",
            helpUsage: "{prefix}decancertext [text]",
            helpUsageExample: "{prefix}decancertext 𝓣𝓱𝓪𝓽𝓖𝓾𝔂™"
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "You didn't provide any text to decancer.";}
        const cleanArgs = ctx.msg.cleanContent?.split(" ");
        const toDecancer = cleanArgs?.slice(cleanArgs!.indexOf(ctx.args[0])).join(" ");
        const decancered = this.decancer(toDecancer!);
        const data: EmbedResponse = {
            embed: {
                title: "Decancer Text",
                color: Hyperion.colors.default,
                footer: {text: `Requested by ${ctx.user.username}#${ctx.user.discriminator}`},
                fields: [
                    {
                        name: "Input",
                        value: `\`\`\`${toDecancer!.length > 1000 ? toDecancer!.substr(0, 1000) + "..." : toDecancer!}\`\`\``
                    },
                    {
                        name: "Output",
                        value: `\`\`\`${decancered.length > 1000 ? decancered.substr(0, 1000)+ "..." : decancered}\`\`\``
                    }
                ]
            }
        }
        return data;
    }

    decancer(text: string): string{
        text = unorm.nfkd(text);
        text = limax(text, {
            replacement: " ",
            tone: false,
            separateNumbers: false,
            maintainCase: true,
            custom: [".", ",", " ", "!", "'", "\"", "?"]
        });
        return text;
    }
}
export default Decancertext;