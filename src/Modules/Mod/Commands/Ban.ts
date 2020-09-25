import {Command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion, ModConfig } from "../../../types";
import { User, Member } from "eris";
import {default as mod} from "../Mod";



class Ban extends Command{
    banDays: number;
    argShift: number;
    constructor(){
        super({
            name: "ban",
            userperms: ["mod"],
            module: "mod",
            needsRolepos: true,
            cooldownTime: 5000,
            hasSub: true,
            helpDetail: "Bans a user.",
            helpUsage: "{prefix}ban [user] [reason]",
            helpSubcommands: "{prefix}ban save - Bans a user, but does not delete their recent messages",
            helpUsageExample: "{prefix}ban boss trolling\n{prefix}ban save wuper trolling",
            botperms: ["banMembers"]
        });
        this.banDays = 7;
        this.argShift = 0;
    }

    async execute(ctx: ICommandContext<mod>, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache Failure, couldn't find bot user";}
        if(!ctx.args[this.argShift]){return "Please specify a user!";}
        if(!bot.permission.has("banMembers")){return "I cannot ban anyone without the `ban members` permission.";}
        const toBan = await Hyperion.utils.banResolver(ctx.args[this.argShift], ctx.guild.members, Hyperion);
        if(!toBan){return "Provide a valid user to ban!";}
        if(toBan.id === ctx.user.id){return "You can't ban yourself!";}
        if(toBan.id === Hyperion.client.user.id){return "I can't ban myself!";}
        if(toBan instanceof User){
            return await this.doBan(ctx, Hyperion, toBan, ctx.args.slice(this.argShift+1).join(" "));
        }
        if(toBan instanceof Member){
            if(await ctx.module.isMod(toBan, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
            if(await ctx.module.isProtected(toBan, ctx.guild)){return "That user is protected from mod actions!";}
            if(bot.roles.length === 0){return "I need a role higher than the user's highest role to ban them, I can't do that with no roles!";}
            const userRoles = Hyperion.utils.sortRoles(toBan.roles, ctx.guild.roles);
            const botRoles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);
            if(userRoles[0] && userRoles[0].position >= botRoles[0].position){return "I can't ban someone with the same highest role or a higher role than me";}
            return await this.doBan(ctx, Hyperion, toBan.user, ctx.args.slice(this.argShift+1).join(" "));
        }
        return "You shouldnt be able to see this message, but if you do, Congrats! You found a bug!";
    }

    async doBan(ctx: ICommandContext<mod>, Hyperion: IHyperion, user: User, reason: string): Promise<string>{
        if(!reason){reason = "No reason given.";}
        let auditReason = reason;
        if(auditReason.length > 509){
            auditReason = auditReason.substring(0, 508) + "...";
        }
        const config = await Hyperion.managers.guild.getModuleConfig<ModConfig>(ctx.guild.id, "mod");
        if(config.dmOnBan){await ctx.module.banDM(user, ctx.guild.name, reason);}
        try{
            auditReason = encodeURIComponent(auditReason);
            await ctx.guild.banMember(user.id, this.banDays, auditReason);
        }catch(err){
            return err.message;
        }
        ctx.module.makeLog({
            user: user.id,
            moderator: ctx.member.id,
            moderationType: "ban",
            reason: reason,
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false,
            autoEnd: false
        }, user);
        this.modDeleteAfter(ctx, Hyperion);
        let response = `Banned ${user.username}#${user.discriminator}!`;
        if(ctx.user.id === "253233185800847361"){response = `Beaned ${user.username}#${user.discriminator}!`;}
        return response;
    }
}

class BanSave extends Ban{
    constructor(){
        super();
        this.name = "save";
        this.banDays = 0;
        this.argShift = 1;
        this.id = this.name;
    }
}
const subarr = [BanSave];
export default Ban;
export {subarr as subcmd};
