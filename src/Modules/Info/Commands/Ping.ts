import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Message } from "eris";

class Ping extends Command{
    constructor(){
        super({
            name: "ping",
            module: "info",
            aliases: ["pong"],

            alwaysEnabled: true,
            selfResponse: true,

            helpDetail: "Shows current latency.",
            helpUsage: "{prefix}ping",
            noExample: true
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<Message>{
        return await ctx.channel.createMessage("Ping?").then((msg: Message) => {
            return msg.edit(`Pong! \`${msg.timestamp-ctx.msg.timestamp}ms\``);
        });
    }
}
export default Ping;