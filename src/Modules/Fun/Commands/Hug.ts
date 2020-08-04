import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Embed } from "eris";

const gifs: Array<string> = [
    "https://media.tenor.com/images/bc8e962e6888249486a3e103edd30dd9/tenor.gif",
    "https://media.tenor.com/images/afbc39fcc4cbe67d9622f657d60d41cf/tenor.gif",
    "https://media.tenor.com/images/1e058dc8d0ccd337b6d26cbab43b6e30/tenor.gif",
    "https://media.tenor.com/images/294a14e1112eff23490d0d91a948194b/tenor.gif",
    "https://media.tenor.com/images/0a1652de311806ce55820a7115993853/tenor.gif",
    "https://media1.tenor.com/images/78d3f21a608a4ff0c8a09ec12ffe763d/tenor.gif",
    "https://media1.tenor.com/images/d0406185ffbfe1124c6af11bb15650a3/tenor.gif",
    "https://media.tenor.com/images/9d43ab74529bb6814a6d406a5d26e1cc/tenor.gif",
    "https://media.tenor.com/images/0e1038e5e23d607f88b80eed880610b6/tenor.gif"
];
class Hug extends Command{
    constructor(){
        super({
            name: "hug",
            module: "fun",
            helpDetail: "Give someone a big hug.",
            helpUsage: "{prefix}hug [text]",
            helpUsageExample: "{prefix}hug @arch hi cutie"
        });
    }

    
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<{embed: Partial<Embed>}>{
        const randomInt = Math.floor(Math.random() * gifs.length);
        const data = {
            embed: {
                description: `${ctx.user.mention} hugged ${ctx.args.join(" ")}!`,
                color: Hyperion.colors.default,
                timestamp: new Date(),
                image: {
                    url: gifs[randomInt]
                }
            }
        };
        
        return data;
    }
}
export default Hug;