import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import {default as limax} from "limax";
import {default as unorm} from "unorm";

class Decancertext extends Command{
    constructor(){
        super({
            name: "decancertext",
            module: "fun",
            helpDetail: "decancers text input",
            helpUsage: "{prefix}decancertext [text]",
            helpUsageExample: "{prefix}decancertext 𝓣𝓱𝓪𝓽𝓖𝓾𝔂™"
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "You didnt provide any input";}
        return this.decancer(ctx.args.join(" "));
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