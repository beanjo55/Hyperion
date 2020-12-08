import hyperion, { CommandContext, CommandResponse } from "../../../main";
import Command from "../../../Structures/Command";

export default class Ping extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "ping",
            help: {detail: "Shows bot latency", usage: "{prefix}ping"},
            module: "info"
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        const start = Date.now();
        await ctx.channel.createMessage("Ping?").then(x => {
            x.edit(`Pong! ${Date.now() - start}ms`);
        }).catch(() => undefined);
        return {success: true, self: true, content: null};
    }
}