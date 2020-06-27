/* eslint-disable @typescript-eslint/no-empty-function */
import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";

class Role extends Command{
    constructor(){
        super({
            name: "role",
            module: "manager",
            userperms: ["manager"],
            cooldownTime: 5000,
            helpDetail: "Adds or removes a role from a user.",
            helpUsage: "{prefix}role [user] [role]\n{prefix}role [user] +[role]\n{prefix}role [user] -[role]",
            helpUsageExample: "{prefix}role bean Admin\n{prefix}role bean +Admin\n{prefix}role bean -Admin"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify a user.";}
        if(!ctx.args[1]){return "Please specify a role.";}
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Something went wrong!";}
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to add or remove roles from users.";}
        if(bot.roles.length === 0){return "Due to Discord permissions, I need to have a role higher than a role to manage it. I can't do that with no roles.";}
        let operation = "toggle";
        if(ctx.args[1].startsWith("+")){operation = "add";}
        if(ctx.args[1].startsWith("-")){operation = "remove";}
        const roleInput = operation === "toggle" ? ctx.args[1] : ctx.args[1].substring(1);
        const roleObj = Hyperion.utils.resolveRole(roleInput, ctx.guild.roles);
        if(!roleObj){return "I dont know what that role is, try a role ID.";}
        const user = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!user){return "Invalid user provided! Try the user ID or name.";}
        const botRoles = Hyperion.utils.sortRoles(bot.roles, ctx.guild.roles);
        if(botRoles[0].position <= roleObj.position){return "I can't manage roles that are my highest role, or above my highest role.";}
        if(operation === "add"){
            if(user.roles.includes(roleObj.id)){return "No changes were made.";}
            try{
                await user.addRole(roleObj.id);
                return "Success!";
            }catch{
                return "Something went wrong!";
            }
        }
        if(operation === "remove"){
            if(!user.roles.includes(roleObj.id)){return "No changes were made.";}
            try{
                await user.removeRole(roleObj.id);
                return "Success!";
            }catch{
                return "Something went wrong!";
            }
        }
        if(!user.roles.includes(roleObj.id)){
            try{
                await user.addRole(roleObj.id);
                return "Success!";
            }catch{
                return "Something went wrong!";
            }
        }else{
            try{
                await user.removeRole(roleObj.id);
                return "Success!";
            }catch{
                return "Something went wrong!";
            }
        }
    }
}
export default Role;