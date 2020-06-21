import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, IModerationContext} from "../../../types";
import {default as Mod} from "../Mod";

class Mute extends Command{
    constructor(){
        super({
            name: "mute",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 3000,
            helpDetail: "Adds a role to prevent a user from speaking, with an optional time limit",
            helpUsage: "{prefix}mute [user] [reason]\n{prefix}mute [user] [time] [reason]",
            helpUsageExample: "{prefix}mute wuper shitposting\n{prefix}mute boss 1d shitposting"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const module = ctx.module as Mod;
        const roleCheck = await module.checkMuteRole(Hyperion, ctx.guild);
        if(typeof roleCheck === "string"){return roleCheck;}
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){
            Hyperion.logger.warn("Hyperion", `Failed to find bot user for mute management check in guild ${ctx.guild.id}`, "Member Cache");
            return "Somehthing went wrong";
        }
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to mute users";}
        if(!await ctx.module.canManageRole(Hyperion, ctx.guild, roleCheck, bot)){
            return "I cant manage the mute role, make sure I have a role that is above the mute role in the role list";
        }
        if(!ctx.args[0]){return "Please specify a user to mute";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!target){return "I dont know who that is, try a user ID or mention";}
        if(await module.isMod(Hyperion, target, ctx.guild)){return "That user is a mod and is protected from mod actions";}
        if(target.roles.includes(roleCheck.id)){return "That user is already muted";}
        let reason = "No reason provided";
        let time = 0;
        let stringLength = "";
        if(ctx.args[1]){
            const parsed = module.parseTime(ctx.args[1]);
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
                moderationEnd: false
            };
            if(time !== 0){
                data.length = time;
            }
            if(stringLength !== ""){
                data.stringLength = stringLength;
            }
            module.makeLog(Hyperion, data, target.user);
            return `Muted ${target.username}#${target.discriminator}`;
        }catch{
            return "Something went wrong";
        }
    }


}
export default Mute;