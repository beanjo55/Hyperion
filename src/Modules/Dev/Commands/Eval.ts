import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Embed } from "eris";
import {inspect} from "util";



class Eval extends Command{
    constructor(){
        super({
            name: "eval",
            module: "dev",
            aliases: ["e", "evaluate", "runcodefortheboys"],

            internal: true,
            alwaysEnabled: true,

            dev: true,

            hasSub: true,

            helpDetail: "Evaluates JavaScript code",
            helpSubcommands: "{prefix}eval async - Evaluates JavaScript code in an async context",
            helpUsage: "{prefix}eval code\n{prefix}eval async code",
            helpUsageExample: "{prefix}eval 1 + 1\n{prefix}eval async return 1 + 1"
        });

    }
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        const code = ctx.args.join(" ");
       
        try{
            let evaled = await eval(code);
            if(typeof evaled !== "string"){
                evaled = inspect(evaled, {depth: 0});
            }
            return await this.evalresult(ctx, evaled, Hyperion);
        }catch(err){
            return this.evalerror(err, Hyperion);
        }
    }

    clean(text: string, Hyperion: IHyperion): string{
        if (typeof(text) === "string"){
            return Hyperion.redact(text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)));
        }else{
            return text;
        }
    }

    async evalresult(ctx: ICommandContext, result: string, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        const output = this.clean(result, Hyperion);
        if(output.length > 1990){
            console.log(output);
            return "The output was too long, it was sent to the console log";
        }
        const data ={
            embed: {
                // eslint-disable-next-line @typescript-eslint/camelcase
                author: { name: "Eval Results", icon_url: ctx.user.avatarURL },
                description: "```js\n" + output + "```",
                color: Hyperion.defaultColor,
                timestamp: new Date()
            }
        };
        return data;
    }

    evalerror(result: string, Hyperion: IHyperion): string{
        return "`ERROR`\n```xl\n" + this.clean(result, Hyperion) + "```";
    }

}

class AsyncEval extends Eval{
    constructor(){
        super();
        this.name = "async";
        this.id = this.name;
        this.aliases = ["a"];
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        const code = "async function run(ctx){" + ctx.args.slice(1).join(" ") + "}; run(ctx)";
        try{
            let evaled = await eval(code);
            if(typeof evaled !== "string"){
                evaled = inspect(evaled, {depth: 0});
            }
            return await this.evalresult(ctx, evaled, Hyperion);
        }catch(err){
            return this.evalerror(err, Hyperion);
        }

    }
}
const subarr = [AsyncEval];
export default Eval;
export {subarr as subcmd};
