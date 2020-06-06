import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import {default as Mod} from "../Mod";
import { User, Message } from "eris";

class Reason extends Command{
    constructor(){
        super({
            name: "reason",
            module: "mod",
            userperms: ["mod"],
            helpDetail: "Updates the reason for a case",
            helpUsage: "{prefix}reason [case number] [new reason]",
            helpUsageExample: "{prefix}reason 1 reverted to ban, see case 2"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const module = (ctx.module as Mod);
        if(!ctx.args[0]){return "Please specify a case number";}
        const caseNum = Number(ctx.args[0]);
        if(isNaN(caseNum) || caseNum < 1){return "Please enter a valid case number";}
        const caseData = await Hyperion.managers.modlog.getCaseByCasenumber(ctx.guild.id, caseNum);
        if(!caseData){return "That case was not found";}
        if(caseData.moderator !== ctx.user.id && !ctx.member.permission.has("manageGuild")){return "Only server managers and administrators can edit cases they didnt make";}
        if(!ctx.args[1]){return "Please enter a new reason";}
        await Hyperion.managers.modlog.updateReason(caseData.mid, ctx.args.slice(1).join(" "));
        caseData.reason = ctx.args.slice(1).join(" ");
        if(caseData.logPost){
            const channel = await module.getLogChannel(Hyperion, ctx.guild.id);
            if(channel){
                const channelObj = ctx.guild.channels.get(channel);
                if(channelObj && channelObj?.type === 0){
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    const user = (Hyperion.client.users.get(caseData.user) ?? await Hyperion.client.getRESTUser(caseData.user).catch(() => {})) as User;
                    const post = module.makeEmbed(module.logToContext(caseData, Hyperion), user);
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    const oldPost = (channelObj.messages.get(caseData.logPost) ?? await channelObj.getMessage(caseData.logPost).catch(() => {})) as Message;
                    if(!oldPost){return "Success!";}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    oldPost.edit(post).catch(() => {});
                }
            }
        }
        return "Success!";
    }
}
export default Reason;