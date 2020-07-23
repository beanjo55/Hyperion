/* eslint-disable @typescript-eslint/no-empty-function */
import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";

class Say extends Command{
    constructor(){
        super({
            name: "say",
            aliases: ["echo"],
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 5000,
            helpDetail: "Makes the bot repeat your message in a channel you specify.",
            helpUsage: "{prefix}say [channel] [message]",
            helpUsageExample: "{prefix}say #general I'm a talking bot!",
            selfResponse: true
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<any>{
        if(!ctx.args[0]){return ctx.channel.createMessage("Please specify a channel!").catch(() => {});}
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return ctx.channel.createMessage("I could not find that channel in this server, try using the channel ID or mention.").catch(() => {});}
        if(!ctx.args[1]){return ctx.channel.createMessage("You need to provide a message for me to say.").catch(() => {});}
        await channel.createMessage(ctx.args.slice(1).join(" ")).then(() => {
            Hyperion.redis.set(`Deleted:${ctx.msg.id}`, 1, "EX", 5);
        }).catch(() => {
            Hyperion.redis.del(`Deleted:${ctx.msg.id}`);
        });
        ctx.msg.delete().catch(() => {});
    }
}
export default Say;