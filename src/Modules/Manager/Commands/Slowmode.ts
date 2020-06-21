import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";

class Slowmode extends Command{
    constructor(){
        super({
            name: "slowmode",
            module: "manager",
            userperms: ["manager"],
            cooldownTime: 5000,
            helpDetail: "Sets slowmode in a channel",
            helpUsage: "{prefix}slowmode [channel] [time]",
            helpUsageExample: "{prefix}slowmode #general 3"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify a channel";}
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return "Im not sure what channel that is, try a channel mention or channel ID";}
        if(!ctx.args[1]){return "Please enter a time";}
        const time = Number(ctx.args[1]);
        if(isNaN(time)){return "I dont understand that time, try just a number";}
        if(time > 21600){return "That time is too long, try a shorter one";}
        try{
            await channel.edit({
                rateLimitPerUser: time
            }, "Hyperion Slowmode");
            return "Successfully set slowmode!";
        }catch{
            return "Something went wrong";
        }
    }
}
export default Slowmode;