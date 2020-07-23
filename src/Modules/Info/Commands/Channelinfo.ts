
import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion, CommandResponse} from "../../../types";

class Channelinfo extends Command{
    constructor(){
        super({
            name: "channelinfo",
            module: "info",
            helpDetail: "Shows information on a channel.",
            helpUsage: "{prefix}channelinfo [channel]",
            helpUsageExample: "{prefix}channelinfo #contribs",
            unlisted: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "Please specify a channel.";}
        const channel = Hyperion.utils.resolveGuildChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return "I dont know what channel that is.";}
        if(!channel.permissionsOf(ctx.member.id).has("readMessages")){return "I dont know what channel that is.";}
        return channel.mention;
    }
}
export default Channelinfo;