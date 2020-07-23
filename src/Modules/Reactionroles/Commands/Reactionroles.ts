import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import {ReactionRole, RRConfig} from "../../../Core/DataManagers/MongoGuildManager";

class Reactionroles extends Command{
    constructor(){
        super({
            name: "reactionroles",
            aliases: ["rr", "reactionrole"],
            listUnder: "manager",
            module: "reactionroles",
            userperms: ["manager"],
            helpDetail: "Manages reaction roles"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return "no channel";}
        const message = channel.messages.get(ctx.args[1]) ?? await channel.getMessage(ctx.args[1]);
        if(!message){return "no message";}
        const emote = EmoteRegex.exec(ctx.args[2]);
        if(!emote){return "no emote";}
        const emoteName = emote![2];
        const emoteID = emote?.[3];
        const role = Hyperion.utils.resolveRole(ctx.args[3], ctx.guild.roles);
        if(!role){return "no role";}
        const name = ctx.args[4];
        const erMap = new Map<string, string>();
        erMap.set(emoteName, role.id);
        const rr = new ReactionRole({
            name,
            erMap,
            channel: channel.id
        });
        const config = await Hyperion.managers.guild.getModuleConfig<RRConfig>(ctx.guild.id, "reactionroles");
        if(!(config.rr instanceof Map)){config.rr = new Map<string, ReactionRole>(Object.entries(config.rr ?? {}));}
        config.rr.set(message.id, rr);
        await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "reactionroles", config);
        await message.addReaction(emoteID !== undefined ? `${emoteName}:${emoteID}` : emoteName);
        return "added reaction role";
    }
}
export default Reactionroles;