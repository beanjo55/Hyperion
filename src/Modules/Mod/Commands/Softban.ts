import {Command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion, ModConfig } from "../../../types";
import { User } from "eris";
import {default as mod} from "../Mod";



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
            helpUsageExample: "{prefix}softban wuper trolling",
            botperms: ["banMembers"]
        });
    }

    async execute(ctx: ICommandContext<mod>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify a user to softban";}
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache Failure, couldnt find bot user.";}
        if(!bot.permission.has("banMembers")){return "I cannot ban anyone without the `ban members` permission.";}
        const toBan = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!toBan){return "Invalid user provided, try their user ID or mention.";}
        if(toBan.id === ctx.user.id){return "You can't softban yourself!";}
        if(toBan.id === Hyperion.client.user.id){return "I can't softban myself!";}
        if(await ctx.module.isMod(toBan, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(await ctx.module.isProtected(toBan, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(bot.roles.length === 0){return "I need a role higher than the user's highest role to softban them, I cant do that with no roles!";}
        const userRoles = Hyperion.utils.sortRoles(toBan.roles ?? [], ctx.guild.roles);
        const botRoles = Hyperion.utils.sortRoles(bot.roles ?? [], ctx.guild.roles);
        if(userRoles[0] && userRoles[0].position >= botRoles[0].position){return "I can't softban someone with the same highest role or a higher role than me!";}
        return await this.doBan(ctx, Hyperion,  toBan.user, ctx.args.slice(1).join(" "));
        
    }

    async doBan(ctx: ICommandContext<mod>, Hyperion: IHyperion, user: User, reason: string): Promise<string>{
        if(!reason){reason = "No reason given.";}
        let auditReason = reason;
        if(auditReason.length > 509){
            auditReason = auditReason.substring(0, 508) + "...";
        }
        const config = await Hyperion.managers.guild.getModuleConfig<ModConfig>(ctx.guild.id, "mod");
        if(config.dmOnKick){await ctx.module.kickDM(user, ctx.guild.name, reason);}
        try{
            await ctx.guild.banMember(user.id, 7, auditReason);
            await ctx.guild.unbanMember(user.id);
        }catch{
            return "Something went wrong!";
        }
        ctx.module.makeLog({
            user: user.id,
            moderator: ctx.member.id,
            moderationType: "softban",
            reason: reason,
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false,
            autoEnd: false
        }, user);
        this.modDeleteAfter(ctx, Hyperion);
        return `Softbanned ${user.username}#${user.discriminator}`;
    }
}
export default Softban;