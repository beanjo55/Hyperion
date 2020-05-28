import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GuildChannel, Embed } from "eris";
import { LoggingConfig } from "../../../Core/DataManagers/MongoGuildManager";

const eventNames: Array<string> = [
    "banAdd",
    "banRemove",
    "memberAdd",
    "memberRemove",
    "messageDelete",
    "messageEdit",
    "bulkDelete",
    "memberNicknameChange"
];
const settingNamesL: Array<string> = ["logchannel", "ignoredchannels", "showavatar", "enable", "disable"];


class Logging extends Command{
    constructor(){
        super({
            name: "logging",
            module: "logging",
            userperms: ["manager"],
            
            helpDetail: "Configures the logging settings for the server, running the command with no nputs shows current settings",
            helpUsage: "{prefix}logging\n{prefix}logging [setting] [value]\n{prefix}logging enable [event name]\n{prefix}logging disable [event name]",
            helpUsageExample: "{prefix}logging logChannel #logs\n{prefix}logging enable messagedelete\n{prefix}logging disable messagedelete"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>} | string>{
        if(!ctx.args[0]){
            return await this.showOverallSettings(ctx, Hyperion);
        }
        
        if(!settingNamesL.includes(ctx.args[0].toLowerCase())){return "I dont know what that setting is";}
        if(ctx.args[0].toLowerCase() === "logchannel"){
            if(!ctx.args[1]){return "Please specify a channel";}
            const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!channel){return "Im not sure what that channel is";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {logChannel: channel.id});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update log channel on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated Log Channel";
        }

        if(ctx.args[0].toLowerCase() === "ignoredchannels"){
            if(!ctx.args[1]){return "Please specify a channel";}
            const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!channel){return "Im not sure what that channel is";}

            const config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            const size = config.ignoredChannels.length;
            if(config.ignoredChannels !== []){
                if(config.ignoredChannels.includes(channel.id)){
                    const index: number = config.ignoredChannels.indexOf(channel.id);
                    config.ignoredChannels.splice(index, 1);
                }else{
                    config.ignoredChannels.push(channel.id);
                }
            }else{
                config.ignoredChannels = [channel.id];
            }
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {ignoredChannels: config.ignoredChannels});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update ignored logging channels on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            if(config.ignoredChannels.length > size){
                return "Added channel to ignored channels";
            }else{
                return "Removed channel from ignored channels";
            }
        }

        if(ctx.args[0].toLowerCase() === "showavatar"){
            if(!ctx.args[1]){return "Please specify true/false or yes/no";}
            const result = Hyperion.utils.input2boolean(ctx.args[1]);
            if(!result){return "Im not sure what you are trying to say, try yes or no";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {showAvatar: result});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update showAvatar on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated Show Avatars Setting";
        }

        if(ctx.args[0].toLowerCase() === "enable"){
            if(!ctx.args[1]){return "Please specify an event";}
            const config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            if(!eventNames.map((e: string) => e.toLowerCase()).includes(ctx.args[1].toLowerCase())){return "I dont know what event that is";}
            const name = eventNames[eventNames.map((e: string) => e.toLowerCase()).indexOf(ctx.args[1].toLowerCase())];
            if(config[name]?.enabled === true){
                return "that event is already enabled";
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {};
            data[name] = {enabled: true, channel: "default"};
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", data);
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to enable ${name} on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "The event was enabled";
        }

        if(ctx.args[0].toLowerCase() === "disable"){
            if(!ctx.args[1]){return "Please specify an event";}
            const config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            if(!eventNames.map((e: string) => e.toLowerCase()).includes(ctx.args[1].toLowerCase())){return "I dont know what event that is";}
            const name = eventNames[eventNames.map((e: string) => e.toLowerCase()).indexOf(ctx.args[1].toLowerCase())];
            if(config[name]?.enabled === false){
                return "that event is already disabled";
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {};
            data[name] = {enabled: false, channel: "default"};
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", data);
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to disable ${name} on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "The event was disabled";
        }
        return "this should never be reached";
    }

    async showOverallSettings(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>} | string>{
        const config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
        if(!config){return "An error occured";}
        const chanObj = ctx.guild.channels.get(config.logChannel);
        let channelName = "Not Set";
        if(chanObj){channelName = chanObj.mention;}
        let ignoredChannels= "None Set";
        if(config.ignoredChannels){
            ignoredChannels = config.ignoredChannels.map((C: string) => ctx.guild.channels.get(C)?.mention).join(", ");
        }
        let showAv = "No";
        if(config?.showAvatar === true){showAv = "Yes";}

        let enabled = "";
        let disabled = "";
        Object.getOwnPropertyNames(config).forEach((name: string) => {
            if(eventNames.includes(name)){
                if(config[name].enabled === true){
                    if(enabled !== ""){
                        enabled += `, ${name}`;
                    }else{
                        enabled = name;
                    }
                }
                if(config[name].enabled === false){
                    if(disabled !== ""){
                        disabled += `, ${name}`;
                    }else{
                        disabled = name;
                    }
                }
            }
        });
        if(enabled === ""){enabled = "None";}
        if(disabled === ""){disabled = "None";}
        if(ignoredChannels === ""){ignoredChannels = "None";}

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Logging Configuration",
                color: Hyperion.defaultColor,
                timestamp: new Date,
                description: `The current logging settings for the server are:
                **Log Channel:** ${channelName}
                **Ignored Channels:** ${ignoredChannels}
                **Show Avatar:** ${showAv}
                `,
                fields: [
                    {
                        name: "Enabled Events",
                        value: enabled,
                        inline: false
                    },
                    {
                        name: "Disabled Events",
                        value: disabled,
                        inline: false
                    }
                ]
            }
        };
        return data;
    }
}
export default Logging;
