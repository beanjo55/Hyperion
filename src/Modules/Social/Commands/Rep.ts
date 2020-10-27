import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
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

    // eslint-disable-next-line complexity
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<{content: string, allowedMentions?: {users: Array<string>}}>{
        if(ctx.args[0] && ctx.args[1] && (ctx.args[0].toLowerCase() === "void" || (ctx.args[0].toLowerCase() === "the" && ctx.args[1].toLowerCase() === "void"))){
            const time = await Hyperion.managers.user.getRepTime(ctx.user.id);
            const acks = await Hyperion.managers.user.getAcks(ctx.user.id);
            const period = acks.pro ? day/2 : day;
            if(ctx.args.length === 0){
                if(Date.now() - time <= period){
                    return {content: `You can give more rep in ${msc(period - (Date.now()-time))}`};
                }else{
                    return {content: "You can give a rep point now!"};
                }
            }
            if((Date.now() - time <= period) && !ctx.admin){
                return {content: `You can give more rep in ${msc(period - (Date.now()-time))}`};
            }
            Hyperion.redis.incr("void");
            const voidCount = await Hyperion.redis.get("void");
            Hyperion.managers.user.setRepTime(ctx.user.id);
            return {content: `You threw your rep to the void. ${voidCount} reps have been discarded there so far`};
        }
        const lucky = randomInt(0, 100) === 69;
        const target = await Hyperion.utils.op8(ctx.args[0], ctx.guild);
        const time = await Hyperion.managers.user.getRepTime(ctx.user.id);
        const acks = await Hyperion.managers.user.getAcks(ctx.user.id);
        const period = acks.pro ? day/2 : day;
        if(ctx.args.length === 0){
            if(Date.now() - time <= period){
                return {content: `You can give more rep in ${msc(period - (Date.now()-time))}`};
            }else{
                return {content: "You can give a rep point now!"};
            }
        }
        if((Date.now() - time <= period) && !ctx.admin){
            return {content: `You can give more rep in ${msc(period - (Date.now()-time))}`};
        }
        if(!target){return {content: "A valid user was not found!"};}
        if(target.id === ctx.user.id){return {content: "You can't rep yourself!"};}
        Hyperion.managers.user.gotRep(target.id);
        Hyperion.managers.user.gaveRep(ctx.user.id);
        Hyperion.managers.user.setRepTime(ctx.user.id);
        let out = `${ctx.user.mention} gave ${target.mention} 1 rep point!`;
        if(lucky){
            Hyperion.managers.user.gotRep(ctx.user.id);
            out += "\nLooks like it's your lucky day! You have also gained a rep point! <a:happykitty:734450859026546699>";
        }
        const allowedMentions: {users: Array<string>} = {users: []};
        if(!ctx.msg.mentions[0] || ctx.msg.mentions[0].id !== target.id){
            allowedMentions.users.push(target.id);
        }
        return {content: out, allowedMentions};
    }
}
export default Rep;
