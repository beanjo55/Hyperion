import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext, UserConfig} from "../../../types";
// eslint-disable-next-line no-unused-vars
import {Member} from "eris";
import {default as msc} from "pretty-ms";
const day: number = 86400000;
import {randomInt} from "mathjs";
const upper: number = 350;
const lower: number = 150;

class Daily extends Command{
    constructor(){
        super({
            name: "daily",
            module: "social",
            aliases: ["dly", "dalies"],
            helpDetail: "Collect your daily money or give it to someone else",
            helpUsage: "{prefix}daily\n{prefix}daily [user]",
            helpUsageExample: "{prefix}daily\n{prefix}daily @bean"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        const payout: number = randomInt(lower, upper);
        const target: Member | undefined = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        let time: number = await Hyperion.managers.user.getDailyTime(ctx.user.id);
        if(ctx.args.length === 0){
            if(Date.now() - time <= day){
                return `You can collect or give daily money in ${msc(day - (Date.now()-time))}`;
            }else{
                return "You can collect or give daily money now!";
            }
        }
        if((Date.now() - time <= day) && !ctx.admin){
            return `You can collect or give daily money in ${msc(day - (Date.now()-time))}`;
        }
        if(!target && ctx.args[0]){return "Who?";}
        if(!target && !ctx.args[0]){
            Hyperion.managers.user.changeMoney(ctx.user.id, payout);
            Hyperion.managers.user.setDailyTime(ctx.user.id);
            return `You collected your daily money of $${payout}!`;
        }
        if(!target){return "Who?";}
        Hyperion.managers.user.changeMoney(target.id, payout);
        Hyperion.managers.user.setDailyTime(ctx.user.id);
        return `${ctx.user.mention} gave ${target.mention} their daily money of $${payout}!`;

    }
}
export default Daily;