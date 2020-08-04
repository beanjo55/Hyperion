import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, IModerationContext} from "../../../types";
import Mod from "../Mod";

class Unmute extends Command{
    constructor(){
        super({
            name: "unmute",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 3000,
            helpDetail: "Unmutes a user.",
            helpUsage: "{prefix}unmute [user] [optional reason]",
            helpUsageExample: "{prefix}unmute sally\n{prefix}unmute bean appealed",
            botperms: ["manageRoles"]
        });
    }

    async execute(ctx: ICommandContext<Mod>, Hyperion: IHyperion): Promise<string>{
        const roleCheck = await ctx.module.checkMuteRole(ctx.guild);
        if(typeof roleCheck === "string"){return roleCheck;}
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){
            Hyperion.logger.warn("Hyperion", `Failed to find bot user for mute management check in guild ${ctx.guild.id}`, "Member Cache");
            return "Somehthing went wrong";
        }
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to unmute users.";}
        if(!await ctx.module.canManageRole(ctx.guild, roleCheck, bot)){
            return "I can't manage the mute role, make sure I have a role that is above the mute role in the role list!";
        }
        if(!ctx.args[0]){return "Please specify a user to unmute";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!target){return "Invalid user provided, try their user ID or mention.";}
        if(await ctx.module.isMod(target, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(await ctx.module.isProtected(target, ctx.guild)){return "That user is protected from mod actions!";}
        if(!target.roles.includes(roleCheck.id)){return "That user is not muted!";}
        let reason = "No reason provided";
        if(ctx.args[1]){
            reason = ctx.args.slice(1).join(" ");
        }
        Hyperion.managers.modlog.markMutesExpired(target.id, ctx.guild.id);
        ctx.module.removeActiveMutes(ctx.guild.id, target.id);
        try{
            await target.removeRole(roleCheck.id, "Hyperion Unmute");
            const data: IModerationContext = {
                user: target.id,
                member: target,
                moderator: ctx.member.id,
                moderationType: "unmute",
                reason: reason,
                time: Date.now(),
                case: -1,
                auto: false,
                guild: ctx.guild,
                moderationEnd: false,
                autoEnd: false
            };
            ctx.module.makeLog(data, target.user);
            return `Unmuted ${target.username}#${target.discriminator}`;
        }catch{
            return "Something went wrong!";
        }
    }
}
export default Unmute;