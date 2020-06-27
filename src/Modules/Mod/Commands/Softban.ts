import {Command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion } from "../../../types";
import { User } from "eris";



class Softban extends Command{
    constructor(){
        super({
            name: "softban",
            userperms: ["mod"],
            aliases: ["hardkick"],
            module: "mod",
            needsRolepos: true,
            cooldownTime: 5000,
            helpDetail: "Bans then unbans a user to clear their recent messages.",
            helpUsage: "{prefix}softban [user] [reason]",
            helpUsageExample: "{prefix}softban wuper trolling"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache Failure, couldnt find bot user.";}
        if(!bot.permission.has("banMembers")){return "I cannot ban anyone without the `ban members` permission.";}
        const toBan = await Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!toBan){return "Invalid user provided, try their user ID or mention.";}
        if(toBan.id === ctx.user.id){return "You can't softban yourself!";}
        if(toBan.id === Hyperion.client.user.id){return "I can't softban myself!";}
        if(await ctx.module.isMod(Hyperion, toBan, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(bot.roles.length === 0){return "I need a role higher than the user's highest role to softban them, I cant do that with no roles!";}
        const userRoles = Hyperion.utils.sortRoles(toBan.roles, ctx.guild.roles);
        const botRoles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);
        if(userRoles[0] && userRoles[0].position >= botRoles[0].position){return "I can't softban someone with the same highest role or a higher role than me!";}
        return await this.doBan(ctx, Hyperion,  toBan.user, ctx.args.slice(1).join(" "));
        
    }

    async doBan(ctx: ICommandContext, Hyperion: IHyperion, user: User, reason: string): Promise<string>{
        if(!reason){reason = "No reason given.";}
        let auditReason = reason;
        if(auditReason.length > 509){
            auditReason = auditReason.substring(0, 508) + "...";
        }
        try{
            await ctx.guild.banMember(user.id, 7, auditReason);
            await ctx.guild.unbanMember(user.id);
        }catch{
            return "Something went wrong!";
        }
        ctx.module.makeLog(Hyperion, {
            user: user.id,
            moderator: ctx.member.id,
            moderationType: "softban",
            reason: reason,
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false
        }, user);
        return `Softbanned ${user.username}#${user.discriminator}`;
    }
}
export default Softban;