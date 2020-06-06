import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
const owoify = require("owoify-js").default;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _clean = (text: any): string => {
    const rx = /`/g;
    const rx2 = /\*/g;
    const rx3 = /\*/g;
    
    if (typeof(text) === "string")
        return text.replace(rx, "\\`").replace(rx2, "\\*").replace(rx3, "\\*");
    else
        return text;
};


const options = ["owo", "uwu", "uvu"];

class Owoify extends Command{
    constructor(){
        super({
            name: "owoify",
            module: "fun",
            aliases: ["uvuify", "uwuify", "uwu", "owo", "uvu"],

            helpDetail: "Owoifies text, with an optional level setting.\nfrom lowest to highest the levels are: owo, uwu, uvu",
            helpUsage: "{prefix}owoify [text]\n{prefix}owoify [level] [text]",
            helpUsageExample: "{prefix}owoify Hyperion is great!\n{prefix}owoify uvu Hyperion is great!"
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        let text = "";
        let output = "";
        const randomInt = Math.floor(Math.random() * options.length);
        switch(ctx.args[0]){
        case "owo":
            text = ctx.args.slice(1, ctx.args.length).join(" ");
            output = _clean(owoify(text, "owo"));
            break;
        case "uwu":
            text = ctx.args.slice(1, ctx.args.length).join(" ");
            output = _clean(owoify(text, "uwu"));
            break;
        case "uvu":
            text = ctx.args.slice(1, ctx.args.length).join(" ");
            output = _clean(owoify(text, "uvu"));
            break;
        default:
            text = ctx.args.slice(0, ctx.args.length).join(" ");
            output = _clean(owoify(text, options[randomInt]));
            break;
        }
        if(output.length>2000){
            output = "The output was too long!";
        }
        if(output.length === 0){
            output = "There was no output";
        }
        return output;
    }
}
export default Owoify;