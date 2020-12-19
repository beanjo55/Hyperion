import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";


class Ignorechannel extends Command{
    constructor(){
        super({
            name: "ignorechannel",
            module: "manager",
            userperms: ["manager"],

            helpDetail: "Makes Hyperion ignore all commands ran in a channel, besides mods and managers.",
            helpUsage: "{prefix}ignorechannel\n{prefix}ignorechannel #channel",
            helpUsageExample: "{prefix}ignorechannel #general"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<CommandResponse>{
        if(!ctx.args[0]){
            return {embed: {
                color: Hyperion.colors.default,
                timestamp: new Date,
                title: "Ignored Channels",
                description: "Currently Ignored Channels:\n```" + (ctx.guildConfig.ignoredChannels.length === 0 ? "None" : ctx.guildConfig.ignoredChannels.map(c => `<#${c}>`).join("\n")) + "```"
            }};
        }
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[0]);
        if(!channel){return "I couldn't find that channe;";}
        let remove = false;
        if(ctx.guildConfig.ignoredChannels.includes(channel.id)){
            ctx.guildConfig.ignoredChannels.splice(ctx.guildConfig.ignoredChannels.indexOf(channel.id));
            remove = true;
        }else{
            ctx.guildConfig.ignoredChannels.push(channel.id);
        }
        try{
            await Hyperion.managers.guild.update(ctx.guild.id, ctx.guildConfig);
            return remove ? `Removed ${channel.mention} from ignored channels.` : `Added ${channel.mention} to ignored channels.`;
        }catch{
            return "Something went wrong updating ignored channels";
        }
    }
}
export default Ignorechannel;