import { AdvancedMessageContent, Message } from "eris";
import { inspect } from "util";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import Command from "../../../Structures/Command";
import {exec} from "child_process";

export default class Exec extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "exec",
            help: {detail: "test", usage: "test"},
            module: "dev",
            specialPerms: "dev",
            aliases: ["ex", "execute"]
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        const code = ctx.args.join(" ");
        this.doEval(code, ctx);
        return {success: true, content: null, literal: true};
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    doEval(code: string, ctx: CommandContext): void {
        try{
            exec(code, (stdout, stderr) => {
                const out = stdout ?? stderr;
                ctx.createMessage({content: "```xl\n" + out + "```"});
            });
        }catch(e){
            ctx.createMessage({content: "```xl\n" + e.message + "```"});
        }
    }
}
