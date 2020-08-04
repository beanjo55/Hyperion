import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, IModerationContext, ModConfig} from "../../../types";
import {default as Mod} from "../Mod";

class Mute extends Command{
    constructor(){
        super({
            name: "mute",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 3000,
            helpDetail: "Adds a role to prevent a user from speaking, with an optional time limit.",
            helpUsage: "{prefix}mute [user] [reason]\n{prefix}mute [user] [time] [reason]",
            helpUsageExample: "{prefix}mute wuper shitposting\n{prefix}mute boss 1d shitposting",
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
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to mute users.";}
        if(!await ctx.module.canManageRole(ctx.guild, roleCheck, bot)){
            return "I can't manage the mute role, make sure I have a role that is above the mute role in the role list!";
        }
        if(!ctx.args[0]){return "Please specify a user to mute!";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!target){return "Invalid user provided, try their user ID or mention.";}
        if(await ctx.module.isMod(target, ctx.guild)){return "That user is a mod and is protected from mod actions!";}
        if(await ctx.module.isProtected(target, ctx.guild)){return "That user is protected from mod actions!";}
        if(target.roles.includes(roleCheck.id)){return "That user is already muted!";}
        let reason = "No reason provided.";
        let time = 0;
        let stringLength = "";
        if(ctx.args[1]){
            const parsed = ctx.module.parseTime(ctx.args[1]);
            if(parsed !== 0 && ctx.args[2]){
                time = parsed;
                stringLength = ctx.args[1];
                reason = ctx.args.slice(2).join(" ");
            }
            else if(parsed !== 0 && !ctx.args[2]){
                stringLength = ctx.args[1];
                time = parsed;
            }else{
                reason = ctx.args.slice(1).join(" ");
            }
        }
        const config = await Hyperion.managers.guild.getModuleConfig<ModConfig>(ctx.guild.id, "mod");
        if(config.dmOnMute){await ctx.module.muteDM(target.user, ctx.guild.name, reason, stringLength !== "" ? stringLength : undefined);}
        try{
            await target.addRole(roleCheck.id, "Hyperion Mute");
            const data: IModerationContext = {
                user: target.id,
                member: target,
                moderator: ctx.member.id,
                moderationType: "mute",
                reason: reason,
                time: Date.now(),
                case: -1,
                auto: false,
                guild: ctx.guild,
                moderationEnd: false,
                autoEnd: false
            };
            if(time !== 0){
                data.length = time;
            }
            if(stringLength !== ""){
                data.stringLength = stringLength;
            }
            ctx.module.makeLog(data, target.user);
            this.modDeleteAfter(ctx, Hyperion);
            return `Muted ${target.username}#${target.discriminator}`;
        }catch{
            return "Something went wrong!";
        }
    }


}
export default Mute;