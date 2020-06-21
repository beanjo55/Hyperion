import {Command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion } from "../../../types";
import { User, Member } from "eris";



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
            helpDetail: "Bans a user",
            helpUsage: "{prefix}ban [user] [reason]",
            helpSubcommands: "{prefix}ban save - Bans a user, but does not delete their recent messages",
            helpUsageExample: "{prefix}ban boss trolling\n{prefix}ban save wuper trolling"
        });
        this.banDays = 7;
        this.argShift = 0;
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache Failure, couldnt find bot user";}
        if(!ctx.args[this.argShift]){return "Please specify a user";}
        if(!bot.permission.has("banMembers")){return " I need the ban members permission to well, ban members";}
        const toBan = await Hyperion.utils.banResolver(ctx.args[this.argShift], ctx.guild.members, Hyperion);
        if(!toBan){return "I couldnt figure out what user that is";}
        if(toBan.id === ctx.user.id){return "You cant ban yourself";}
        if(toBan.id === Hyperion.client.user.id){return "I cant ban myself";}
        if(toBan instanceof User){
            return await this.doBan(ctx, Hyperion, toBan, ctx.args.slice(this.argShift+1).join(" "));
        }
        if(toBan instanceof Member){
            if(await ctx.module.isMod(Hyperion, toBan, ctx.guild)){return "That user is a mod and is protected from mod actions";}
            if(bot.roles.length === 0){return "I need a role higehr than the user's highest role to ban them, I cant do that with no roles";}
            const userRoles = Hyperion.utils.sortRoles(toBan.roles, ctx.guild.roles);
            const botRoles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);
            if(userRoles[0] && userRoles[0].position >= botRoles[0].position){return "I cant ban someone with the same highest role or a higher role than me";}
            return await this.doBan(ctx, Hyperion,  toBan.user, ctx.args.slice(this.argShift+1).join(" "));
        }
        return "You shouldnt be able to see this message, but if you do, Congrats! You found a bug!";
    }

    async doBan(ctx: ICommandContext, Hyperion: IHyperion, user: User, reason: string): Promise<string>{
        if(!reason){reason = "No reason given";}
        let auditReason = reason;
        if(auditReason.length > 509){
            auditReason = auditReason.substring(0, 508) + "...";
        }
        try{
            await ctx.guild.banMember(user.id, this.banDays, auditReason);
        }catch{
            return "Something went wrong!";
        }
        ctx.module.makeLog(Hyperion, {
            user: user.id,
            moderator: ctx.member.id,
            moderationType: "ban",
            reason: reason,
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false
        }, user);
        return `Banned ${user.username}#${user.discriminator}`;
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