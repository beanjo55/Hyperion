import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import {Member} from "eris";
import {default as msc} from "pretty-ms";
const day = 86400000;
import {randomInt} from "mathjs";
class Rep extends Command{
    constructor(){
        super({
            name: "rep",
            module: "social",
            helpDetail: "Gives a rep point to someone else.",
            helpUsage: "{prefix}rep [user]",
            helpUsageExample: "{prefix}rep @bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(ctx.args[0].toLowerCase() === "void" || (ctx.args[0].toLowerCase() === "the" && ctx.args[1].toLowerCase() === "void")){
            const time: number = await Hyperion.managers.user.getRepTime(ctx.user.id);
            const acks = await Hyperion.managers.user.getAcks(ctx.user.id);
            const period = acks.pro ? day/2 : day;
            if(ctx.args.length === 0){
                if(Date.now() - time <= period){
                    return `You can give more rep in ${msc(period - (Date.now()-time))}`;
                }else{
                    return "You can give a rep point now!";
                }
            }
            if((Date.now() - time <= period) && !ctx.admin){
                return `You can give more rep in ${msc(period - (Date.now()-time))}`;
            }
            Hyperion.redis.incr("void");
            const voidCount = await Hyperion.redis.get("void");
            Hyperion.managers.user.setRepTime(ctx.user.id);
            return `You threw your rep to the void. ${voidCount} reps have been discarded there so far`;
        }
        const lucky = randomInt(0, 100) === 69;
        const target: Member | undefined = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        const time: number = await Hyperion.managers.user.getRepTime(ctx.user.id);
        const acks = await Hyperion.managers.user.getAcks(ctx.user.id);
        const period = acks.pro ? day/2 : day;
        if(ctx.args.length === 0){
            if(Date.now() - time <= period){
                return `You can give more rep in ${msc(period - (Date.now()-time))}`;
            }else{
                return "You can give a rep point now!";
            }
        }
        if((Date.now() - time <= period) && !ctx.admin){
            return `You can give more rep in ${msc(period - (Date.now()-time))}`;
        }
        if(!target){return "A valid user was not found!";}
        if(target.id === ctx.user.id){return "You can't rep yourself!";}
        Hyperion.managers.user.gotRep(target.id);
        Hyperion.managers.user.gaveRep(ctx.user.id);
        Hyperion.managers.user.setRepTime(ctx.user.id);
        let out = `${ctx.user.mention} gave ${target.mention} 1 rep point!`;
        if(lucky){
            Hyperion.managers.user.gotRep(ctx.user.id);
            out += "\nLooks like it's your lucky day! You have also gained a rep point! <a:happykitty:734450859026546699>";
        }
        return out;
    }
}
export default Rep;
