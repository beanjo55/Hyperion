import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";
import {default as mod} from "../Mod";

class Warn extends Command{
    constructor(){
        super({
            name: "warn",
            module: "mod",
            userperms: ["mod"],
            helpDetail: "Warns a member and sends them a dm.",
            helpUsage: "{prefix}warn [user] [reason]",
            helpUsageExample: "{prefix}warn wuper Calling Sally an Orangutan"
        });
    }

    async execute(ctx: ICommandContext<mod>, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "Please specify a user";}
        if(!ctx.args[1]){return "Please give a reason";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!target){return "Im not sure who that is.";}
        if(await ctx.module.isMod(target, ctx.guild, true)){return "That user is a mod and cannot be warned";}
        if(await ctx.module.isProtected(target, ctx.guild, true)){return "That user is protected and cannot be warned";}
        ctx.module.makeLog({
            user: target.user.id,
            moderator: ctx.member.id,
            moderationType: "warn",
            reason: ctx.args.slice(1).join(" "),
            auto: false,
            case: -1,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: false,
            autoEnd: false
        }, target.user);
        try{
            const dmChannel = await target.user.getDMChannel();
            let reason = ctx.args.slice(1).join(" ");
            if(reason.length > 1900){reason = reason.substring(0, 1900);}
            await dmChannel.createMessage(`You were warned in ${ctx.guild.name} for: ${reason}`);
            this.modDeleteAfter(ctx, Hyperion);
            return `Sucessfully warned ${target.username}#${target.discriminator}`;
        }catch{
            this.modDeleteAfter(ctx, Hyperion);
            return `Warned ${target.username}#${target.discriminator}, but I was unable to send them a DM`;
        }
    }
}
export default Warn;