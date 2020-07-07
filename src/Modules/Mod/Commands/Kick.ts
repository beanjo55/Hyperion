import {Command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion } from "../../../types";
import { User } from "eris";



class Kick extends Command{
    constructor(){
        super({
            name: "kick",
            userperms: ["mod"],
            module: "mod",
            needsRolepos: true,
            cooldownTime: 5000,
            helpDetail: "Kicks a user.",
            helpUsage: "{prefix}kick [user] [reason]",
            helpUsageExample: "{prefix}kick boss trolling"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify a user to kick";}
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache Failure, couldn't find bot user";}
        if(!bot.permission.has("kickMembers")){return "I cannot kick anyone without the `kick members` permission.";}
        const toKick = await Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!toKick){return "Provide a user to kick!";}
        if(toKick.id === ctx.user.id){return "You can't kick yourself!";}
        if(toKick.id === Hyperion.client.user.id){return "I can't kick myself!";}
        if(await ctx.module.isMod(Hyperion, toKick, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(bot.roles.length === 0){return "I need a role higehr than the user's highest role to kick them, I can't do that with no roles!";}
        const userRoles = Hyperion.utils.sortRoles(toKick.roles, ctx.guild.roles);
        const botRoles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);
        if(userRoles[0] && userRoles[0].position >= botRoles[0].position){return "I can't kick someone with the same highest role or a higher role than me!";}
        return await this.doKick(ctx, Hyperion,  toKick.user, ctx.args.slice(1).join(" "));
    }

    async doKick(ctx: ICommandContext, Hyperion: IHyperion, user: User, reason: string): Promise<string>{
        if(!reason){reason = "No reason given.";}
        let auditReason = reason;
        if(auditReason.length > 509){
            auditReason = auditReason.substring(0, 508) + "...";
        }
        try{
            await ctx.guild.kickMember(user.id, auditReason);
        }catch{
            return "Something went wrong!";
        }
        ctx.module.makeLog(Hyperion, {
            user: user.id,
            moderator: ctx.member.id,
            moderationType: "kick",
            reason: reason,
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false
        }, user);
        return `Kicked ${user.username}#${user.discriminator}!`;
    }
}
export default Kick;