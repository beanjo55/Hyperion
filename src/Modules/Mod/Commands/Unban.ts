import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";

class Unban extends Command{
    constructor(){
        super({
            name: "unban",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 5000,
            helpDetail: "Unbans a user with an optional reason.",
            helpUsage: "{prefix}unban [userID] [optional reason]",
            helpUsageExample: "{prefix}unban 253233185800847361 appealed"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache falure, could not find bot user";}
        if(!bot.permission.has("banMembers")){return "I need the `Ban Members` permission to unban members";}
        if(!ctx.args[0]){return "Please give the user ID of the user you want to unban";}
        if(isNaN(Number(ctx.args[0]))){return "Invalid user provided, make sure it's their user ID!";}
        let reason = "No reason provided.";
        let auditReason = reason;
        if(ctx.args[1]){
            reason = ctx.args.slice(1).join(" ");
            auditReason = reason;
        }
        if(reason.length > 500){
            auditReason = reason.substring(0, 500) + "...";
        }
        try{
            await ctx.guild.unbanMember(ctx.args[0], auditReason);
            const user = Hyperion.client.users.get(ctx.args[0]) ?? await Hyperion.client.getRESTUser(ctx.args[0]);
            if(!user){return "This should be an unreachable error!";}
            ctx.module.makeLog(Hyperion, {
                user: user.id,
                moderator: ctx.member.id,
                moderationType: "unban",
                reason: reason,
                auto: false,
                case: -1,
                guild: ctx.guild
            }, user);
            return `Successfuly unbanned ${user.username}#${user.discriminator}`;
        }catch{
            return "Something went wrong!";
        }
    }
}
export default Unban;