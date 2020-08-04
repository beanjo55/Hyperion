import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import { Role } from "eris";

class Delrole extends Command{
    constructor(){
        super({
            name: "delrole",
            module: "manager",
            userperms: ["manager"],
            needsRolepos: true,
            cooldownTime: 6000,
            botperms: ["manageRoles"],
            helpDetail: "Deletes a role.",
            helpUsage: "{prefix}delrole [role]",
            helpUsageExample: "{prefix}delrole developers"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "A cache error occured!";}
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to delete roles!";}
        if(bot.roles.length === 0){return "Due to discord permissions, I need to be above a role to manage it. I can't do that with no roles!";}

        const botroles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);

        let target = ctx.guild.roles.get(ctx.args[0]);
        if(!target && ctx.msg.roleMentions && ctx.msg.roleMentions[0]){
            target = ctx.guild.roles.get(ctx.msg.roleMentions[0]);
        }
        if(!target){
            target = ctx.guild.roles.find((r: Role) => r.name.toLowerCase().startsWith(ctx.args.join(" ").toLowerCase()));
        }
        if(!target){return "I couldnt find that role";}

        if(botroles[0].position < target.position){return "I can't manage roles that are above my highest role!";}
        if(botroles[0].position === target.position){return "I can't manage roles that are my highest role!";}

        try{
            await target.delete(`User: ${ctx.user.username}#${ctx.user.discriminator}`);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to delete role, command: ${ctx.msg.content}, error: ${err}`, "Delrole");
            return "Something went wrong trying to delete that role!";
        }
        return `Successfully deleted role ${target.name}!`;
    }
}
export default Delrole;