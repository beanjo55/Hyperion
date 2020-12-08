import { AdvancedMessageContent, Message } from "eris";
import { inspect } from "util";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import Command from "../../../Structures/Command";

export default class Eval extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "eval",
            help: {detail: "test", usage: "test"},
            module: "dev",
            specialPerms: "dev",
            aliases: ["e", "runcodefortheboys"],
            hasSub: true
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        const code = ctx.args.join(" ");
        return {success: true, content: await this.doEval(code, ctx), literal: true};
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async doEval(code: string, ctx: CommandContext): Promise<string | AdvancedMessageContent> {
        let evaled = "";
        try{
            evaled = await eval(code);
        }catch(err){
            return `Something went wrong!\n\`\`\`xl\n${err.message}\n\`\`\``;
        }
        if(typeof evaled !== "string"){
            evaled = inspect(evaled, {depth: 0});
        }
        if(evaled.length > 1990){return "The output was too long, it has been sent to the console instead.";}
        return {
            embed: {
                color: this.Hyperion.colors.default,
                title: "Eval Results",
                footer: {text: this.Hyperion.build + " V3"},
                timestamp: new Date,
                description: `\`\`\`js\n${evaled}\n\`\`\``
            }
        };
    }
}

class AsyncEval extends Eval {
    constructor(Hyperion: hyperion, path: string){
        super(Hyperion, path);
        this.name = "asynceval";
        this.aliases = ["ae"];
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        const code = "async function run(ctx){" + ctx.args.join(" ") + "run(ctx)";
        return {success: true, content: await this.doEval(code, ctx), literal: true};
    }
}
const subcommands = [AsyncEval];
export {subcommands as subcommands};