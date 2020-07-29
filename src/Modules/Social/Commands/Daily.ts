import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import {Member} from "eris";
import {default as msc} from "pretty-ms";
const day = 86400000;
import {randomInt} from "mathjs";
const upper = 350;
const lower = 150;

class Daily extends Command{
    constructor(){
        super({
            name: "daily",
            module: "social",
            aliases: ["dly", "dalies"],
            helpDetail: "Collect your daily money or give it to someone else, or if you can collect daily money.",
            helpUsage: "{prefix}daily\n{prefix}daily [user]\n{prefix}daily check",
            helpUsageExample: "{prefix}daily\n{prefix}daily @bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const payout: number = randomInt(lower, upper);
        const target: Member | undefined = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        const time: number = await Hyperion.managers.user.getDailyTime(ctx.user.id);
        const acks = await Hyperion.managers.user.getAcks(ctx.user.id);
        const period = acks.pro ? day/2 : day;
        if(ctx.args[0] && ctx.args[0].toLowerCase() === "check"){
            if(Date.now() - time <= period){
                return `You can collect or give daily money in ${msc(period - (Date.now()-time))}`;
            }else{
                return "You can collect or give daily money now!";
            }
        }
        if((Date.now() - time <= period) && !ctx.admin){
            return `You can collect or give daily money in ${msc(period - (Date.now()-time))}`;
        }
        if(!target && ctx.args[0]){return "A valid user was not found!";}
        if(!target && !ctx.args[0]){
            Hyperion.managers.user.changeMoney(ctx.user.id, payout);
            Hyperion.managers.user.setDailyTime(ctx.user.id);
            return `You collected your daily money of $${payout}!`;
        }
        if(!target){return "Invalid user provided, try their user ID or mention.";}
        Hyperion.managers.user.changeMoney(target.id, payout);
        Hyperion.managers.user.setDailyTime(ctx.user.id);
        return `${ctx.user.mention} gave ${target.mention} their daily money of $${payout}!`;

    }
}
export default Daily;