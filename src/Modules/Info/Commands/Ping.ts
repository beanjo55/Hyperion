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
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<void>{
        if(ctx.args[0] && ctx.args[0].toLowerCase() === "full"){
            const redisStart = Date.now();
            await Hyperion.redis.ping();
            const redisCalc = (Date.now()-redisStart);
            const redisTime = `${redisCalc === 0 ? 1 : redisCalc}`;
            const mongoStart = Date.now();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            await Hyperion.db.client.db("prod").command({ping: 1});
            const mongoTime = `${Date.now() - mongoStart}`;
            const start = Date.now();
            await ctx.channel.createMessage("Ping?").then((msg: Message) => {
                return msg.edit(`Pong! Round Trip Latency: ${Date.now()-start}ms\nShard Latency: ${ctx.guild.shard.latency}ms\nRedis latency: ${redisTime}ms\nMongoDB Latency: ${mongoTime}ms`).catch(() => undefined);
            });
            return;
        }
        const start = Date.now();
        await ctx.channel.createMessage("Ping?").then((msg: Message) => {
            return msg.edit(`Pong! ${Date.now()-start}ms`).catch(() => undefined);
        });
    }
}
export default Ping;