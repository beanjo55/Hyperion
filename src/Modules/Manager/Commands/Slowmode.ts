import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";

class Slowmode extends Command{
    constructor(){
        super({
            name: "slowmode",
            module: "manager",
            userperms: ["manager"],
            cooldownTime: 5000,
            helpDetail: "Sets slowmode in a channel.",
            helpUsage: "{prefix}slowmode [channel] [time]",
            helpUsageExample: "{prefix}slowmode #general 3"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){
            if(ctx.channel.rateLimitPerUser === 0){return "There is no slowmode in this channel";}
            return `The slowmode in this channel is ${ctx.channel.rateLimitPerUser} seconds`;
        }
        if(ctx.args[0] && !ctx.args[1]){
            if(!ctx.args[0]){return "Please enter a time!";}
            const time = Number(ctx.args[0]);
            if(isNaN(time)){return "I don't understand that time, try just a number!";}
            if(time > 21600){return "That time is too long, try a shorter one!";}
            try{
                await ctx.channel.edit({
                    rateLimitPerUser: time
                }, "Hyperion Slowmode");
                return "Successfully set slowmode!";
            }catch{
                return "Something went wrong";
            }
        }
        if(!ctx.args[0]){return "Please specify a channel!";}
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return "I'm not sure what channel that is, try the channel ID or mention!";}
        if(!ctx.args[1]){return "Please enter a time!";}
        const time = Number(ctx.args[1]);
        if(isNaN(time)){return "I don't understand that time, try just a number!";}
        if(time > 21600){return "That time is too long, try a shorter one!";}
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