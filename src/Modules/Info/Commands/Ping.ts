import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../../types";

class Ping extends Command{
    constructor(){
        super({
            name: "ping",
            module: "info",
            aliases: ["pong"],

            alwaysEnabled: true,

            selfResponse: true
        });
    }

    // eslint-disable-next-line no-unused-vars
    async execute(ctx: any, Hyperion: HyperionInterface){
        return await ctx.channel.createMessage("Ping?").then((msg: any) => {
            return msg.edit(`Pong! ${msg.timestamp-ctx.msg.timestamp}ms`);
        });
    }
}
export default Ping;