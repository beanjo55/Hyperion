import {Command} from "../../../Structures/Command";
import {IHyperion, ICommandContext, emoteResponse} from "../../../types";
import {default as vtlModule} from "../VTL";

class VTL extends Command{
    constructor(){
        super({
            name: "vtl",
            module: "vtl",
            listUnder: "manager",
            userperms: ["manager"],

            helpDetail: "Manages VTL linked channels",
            helpUsage: "{prefix}vtl link [text channel] [voice channel]\n{prefix}vtl unlink [text channel] [voice channel]",

            noExample: true
        });
    }

    async execute(ctx: ICommandContext<vtlModule>, Hyperion: IHyperion): Promise<emoteResponse>{
        if(!ctx.guildConfig.pro && !ctx.admin){return {status: "info", response: "This is a pro only command"};}
        if(!ctx.args[0]){return {status: "error", response: "Please provide an option"};}
        if(ctx.args[0].toLowerCase() === "link"){
            if(!ctx.args[1]){return {status: "error", response: "Please provide a text channel"};}
            if(!ctx.args[2]){return {status: "error", response: "Please provide a voice channel"};}

            const textChannel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!textChannel){return {status: "neutral", response: "I couldnt find that text channel"};}

            const voiceChannel = Hyperion.utils.resolveVoiceChannel(ctx.guild, ctx.msg, ctx.args[2]);
            if(!voiceChannel){return {status: "neutral", response: "I couldnt find that voice channel"};}

            const vtlConfig = await ctx.module.getConfig(ctx.guild.id);
            if(vtlConfig.links[voiceChannel.id] !== undefined){return {status: "neutral", response: "That voice channel already has a link."};}

            vtlConfig.links[voiceChannel.id] = textChannel.id;
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "vtl", vtlConfig);
                return {status: "success", response: "Linked Channels!"};
            }catch(err){
                console.error(err);
                return {status: "error", response: "Failed to link channels"};
            }
        }

        if(ctx.args[0].toLowerCase() === "unlink"){
            if(!ctx.args[1]){return {status: "error", response: "Please provide a text channel"};}
            if(!ctx.args[2]){return {status: "error", response: "Please provide a voice channel"};}

            const textChannel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!textChannel){return {status: "neutral", response: "I couldnt find that text channel"};}

            const voiceChannel = Hyperion.utils.resolveVoiceChannel(ctx.guild, ctx.msg, ctx.args[2]);
            if(!voiceChannel){return {status: "neutral", response: "I couldnt find that voice channel"};}

            const vtlConfig = await ctx.module.getConfig(ctx.guild.id);
            if(vtlConfig.links[voiceChannel.id] === undefined){return {status: "neutral", response: "That voice channel doesnt have a link."};}

            delete vtlConfig.links[voiceChannel.id];
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "vtl", vtlConfig);
                return {status: "success", response: "Unlinked Channels!"};
            }catch(err){
                console.error(err);
                return {status: "error", response: "Failed to unlink channels"};
            }
        }

        return {status: "info", response: "unknown option"};
    }
}
export default VTL;