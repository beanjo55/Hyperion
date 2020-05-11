import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";
// eslint-disable-next-line no-unused-vars
import { GuildChannel } from "eris";
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
const settingNames: Array<string> = ["logChannel", "ignoredChannels", "showAvatar", "enable", "disable"];
const settingNamesL: Array<string> = ["logchannel", "ignoredchannels", "showavatar", "enable", "disable"];


class Logging extends Command{
    constructor(){
        super({
            name: "logging",
            module: "logging",
            userperms: ["manager"],
            
            helpDetail: "Configures the logging settings for the server",
            helpUsage: "{prefix}logging WIP",
            helpUsageExample: "{prefix}logging WIP"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(!ctx.args[0]){
            return await this.showOverallSettings(ctx, Hyperion);
        }
        if(!settingNamesL.includes(ctx.args[0].toLowerCase())){return "I dont know what that setting is";}
        if(ctx.args[0].toLowerCase() === "logchannel"){
            let channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
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
            let channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!channel){return "Im not sure what that channel is";}

            let config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            let size = config.ignoredChannels.length;
            if(config.ignoredChannels !== []){
                if(config.ignoredChannels.includes(channel.id)){
                    let index: number = config.ignoredChannels.indexOf(channel.id);
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
            let result = Hyperion.utils.input2boolean(ctx.args[1]);
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
            let config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            if(!eventNames.map((e: string) => e.toLowerCase()).includes(ctx.args[1].toLowerCase())){return "I dont know what event that is";}
            let name = eventNames[eventNames.map((e: string) => e.toLowerCase()).indexOf(ctx.args[1].toLowerCase())];
            if(config[name]?.enabled === true){
                return "that event is already enabled";
            }
            let data: any = {};
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
            let config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
            if(!eventNames.map((e: string) => e.toLowerCase()).includes(ctx.args[1].toLowerCase())){return "I dont know what event that is";}
            let name = eventNames[eventNames.map((e: string) => e.toLowerCase()).indexOf(ctx.args[1].toLowerCase())];
            if(config[name]?.enabled === false){
                return "that event is already disabled";
            }
            let data: any = {};
            data[name] = {enabled: false, channel: "default"};
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", data);
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to disable ${name} on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "The event was disabled";
        }
    }

    async showOverallSettings(ctx: CommandContext, Hyperion: HyperionInterface){
        let config: LoggingConfig = await ctx.module?.getLoggingConfig(Hyperion, ctx.guild.id);
        if(!config){return "An error occured";}
        const chanObj = ctx.guild.channels.get(config.logChannel);
        let channelName: string = "Not Set";
        if(chanObj){channelName = chanObj.mention;}
        let ignoredChannels: string = "None Set";
        if(config.ignoredChannels){
            ignoredChannels = config.ignoredChannels.map((C: string) => ctx.guild.channels.get(C)?.mention).join(", ");
        }
        let showAv: string = "No";
        if(config?.showAvatar === true){showAv = "Yes";}

        let enabled: string = "";
        let disabled: string = "";
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

        const data = {
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