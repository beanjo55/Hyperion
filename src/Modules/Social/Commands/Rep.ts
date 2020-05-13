import {Command} from "../../../Core/Structures/Command";
import {HyperionInterface, CommandContext} from "../../../types";
import {Member} from "eris";
import {default as msc} from "pretty-ms";
const day = 86400000;

class Rep extends Command{
    constructor(){
        super({
            name: "rep",
            module: "social",
            helpDetail: "Gives a rep point to someone else",
            helpUsage: "{prefix}rep [user]",
            helpUsageExample: "{prefix}rep @bean"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<string>{
        const target: Member | undefined = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        const time: number = await Hyperion.managers.user.getRepTime(ctx.user.id);
        if(ctx.args.length === 0){
            if(Date.now() - time <= day){
                return `You can give more rep in ${msc(day - (Date.now()-time))}`;
            }else{
                return "You can give a rep point now!";
            }
        }
        if((Date.now() - time <= day) && !ctx.admin){
            return `You can give more rep in ${msc(day - (Date.now()-time))}`;
        }
        if(!target){return "Who?";}
        if(target.id === ctx.user.id){return "You can\'t rep yourself!";}
        Hyperion.managers.user.gotRep(target.id);
        Hyperion.managers.user.gaveRep(ctx.user.id);
        Hyperion.managers.user.setRepTime(ctx.user.id);
        return `${ctx.user.mention} gave ${target.mention} 1 rep point!`;
    }
}
export default Rep;
