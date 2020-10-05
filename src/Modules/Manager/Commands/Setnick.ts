import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";


class Setnick extends Command{
    constructor(){
        super({
            name: "setnick",
            module: "manager",
            userperms: ["manager"],
            cooldownTime: 10000,
            botperms: ["manageRoles"],
            helpDetail: "Changes a users nickname or resets it.",
            helpUsage: "{prefix}setnick [user] [new nickname]\n{prefix}setnick [user]",
            helpUsageExample: "{prefix}setnick Sally Harbringer"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "A cache error occured!";}
        if(!bot.permission.has("manageNicknames")){return "I don't have permissions to manage nicknames";}
        if(bot.roles.length === 0){return "Due to discord permissions, I need to have a higher role than someone to manage their nickname. I can't do that with no roles!";}
        if(!ctx.args[0]){return "Please specify a user!";}
        const target = await Hyperion.utils.resolveUser(ctx.args[0], ctx.guild, ctx.guild.members);
        if(!target){return "Invalid user provided!";}

        const botroles = Hyperion.utils.sortRoles(bot.roles ?? [], ctx.guild.roles);
        const userroles = Hyperion.utils.sortRoles(target.roles ?? [], ctx.guild.roles);

        if(botroles[0].position === userroles[0].position){return "I can't manage nicknames of users with the same highest role as me";}
        if(botroles[0].position < userroles[0].position){return "I can't manage nicknames of users with a higher role than my highest role";}

        if(target.id === ctx.guild.ownerID){return "Only the owner can change their own nickname!";}

        if(!ctx.args[1]){
            try{
                await target.edit({nick: target.username}, `User: ${ctx.user.username}#${ctx.user.discriminator}`);
            }catch(err){
                return "There was an error trying to reset their nickname!";
            }
            return `Successfully reset ${target.username}'s nickname!`;
        }
        try{
            await target.edit({nick: ctx.args.slice(1).join(" ")}, `User: ${ctx.user.username}#${ctx.user.discriminator}`);
        }catch(err){
            return "There was an error trying to change their nickname!";
        }
        return "Success!";
    }
}
export default Setnick;