import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";
import {default as Mod} from "../Mod";

class Retime extends Command{
    constructor(){
        super({
            name: "retime",
            module: "mod",
            userperms: ["mod"],
            helpDetail: "Retimes an existing case",
            helpUsage: "{prefix}retime [case number] [new time]",
            helpUsageExample: "{prefix}retime 25 4h"
        });
    }

    async execute(ctx: ICommandContext<Mod>, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "Please specify a case to retime";}
        const caseNum = Number(ctx.args[0]);
        if(isNaN(caseNum) || caseNum < 1){return "Please enter a valid case number";}
        const modlog = await Hyperion.managers.modlog.getCaseByCasenumber(ctx.guild.id, caseNum);
        if(!modlog){return "I couldnt find that case";}
        try{
            if(!ctx.module.hasModeration(modlog.moderationType)){return "That action can not be retimed";}
        }catch(err){
            return err.message;
        }
        if((modlog.moderator !== ctx.user.id) && !ctx.member.permission.has("manageGuild")){return "Only managers can retime cases they did not make";}
        if(modlog.expired === true){return "That case has ended and cannot be retimed";}
        if(!ctx.args[1]){return "Please specify a new time";}
        if(ctx.args[1].toLowerCase() === "perm"){
            await ctx.module.removeModerationTime(modlog.mid);
            return "Successfully retimed case";
        }
        const newtime = ctx.module.parseTime(ctx.args[1]);
        if(newtime === 0){return "Invalid time format provided";}
        await ctx.module.updateModerationTime(modlog.mid, newtime, ctx.args[1]);
        return "Successfully retimed case";
    }
}
export default Retime;