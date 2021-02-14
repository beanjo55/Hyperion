import {Command} from "../../../Structures/Command";
// eslint-disable-next-line no-unused-vars
import {emoteResponse, ICommandContext, IHyperion} from "../../../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GuildChannel, Embed } from "eris";
import { LoggingConfig } from "../../../Structures/MongoGuildManager";
import {default as LoggingModule} from "../Logging";

const eventNames: Array<string> = [
    "banAdd",
    "banRemove",
    "memberAdd",
    "memberRemove",
    "messageDelete",
    "messageEdit",
    "bulkDelete",
    "memberNicknameChange",
    "memberRoleAdd",
    "memberRoleRemove",
    "memberRoleUpdate",
    "ghostReact",
    "voiceJoin",
    "voiceLeave",
    "voiceSwitch",
    "roleAdd",
    "roleDelete",
    "roleUpdate",
    "channelAdd",
    "channelDelete",
    "channelUpdate"
];
const settingNamesL: Array<string> = ["logchannel", "ignoredchannels", "showavatar", "ghostreacttime", "ignoredroles", "enableall", "disableall", "newaccountage", "showpreviouscases", "alwaysshowage"];


class Logging extends Command{
    constructor(){
        super({
            name: "logging",
            module: "logging",
            userperms: ["manager"],
            listUnder: "manager",
            
            helpDetail: "Configures the logging settings for the server, running the command with no inputs shows current settings",
            helpUsage: "{prefix}logging\n{prefix}logging [setting] [value]\n{prefix}logging [event name] enable\n{prefix}logging [event name] disable",
            helpUsageExample: "{prefix}logging logChannel #logs\n{prefix}logging messagedelete enable\n{prefix}logging messagedelete disable\n{prefix}logging newaccountage 3"
        });
    }

    // eslint-disable-next-line complexity
    async execute(ctx: ICommandContext<LoggingModule>, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | string | emoteResponse>{
        if(!ctx.args[0]){
            return await this.showOverallSettings(ctx, Hyperion);
        }
        const LowerCaseEvents = eventNames.map(e => e.toLowerCase());
        
        if(!(settingNamesL.includes(ctx.args[0].toLowerCase()) || LowerCaseEvents.includes(ctx.args[0].toLowerCase()))){return "Invalid setting or event provided.";}
        if(ctx.args[0].toLowerCase() === "logchannel" || ctx.args[0].toLowerCase() === "channel"){
            if(!ctx.args[1]){return "Please specify a channel";}
            const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!channel){return "Invalid channel provided.";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {logChannel: channel.id});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update log channel on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated Log Channel";
        }

        if(ctx.args[0].toLowerCase() === "ignoredchannels"){
            if(!ctx.args[1]){return "Please specify a channel.";}
            const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[1]);
            if(!channel){return "Invalid channel provided.";}

            const config: LoggingConfig = await ctx.module.getLoggingConfig(ctx.guild.id);
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
                return "Added channel to ignored channels.";
            }else{
                return "Removed channel from ignored channels.";
            }
        }

        if(ctx.args[0].toLowerCase() === "ignoredroles"){
            if(!ctx.args[1]){return "Please specify a role.";}
            const role = Hyperion.utils.resolveRole(ctx.args[1], ctx.guild.roles);
            if(!role){return "Invalid role provided.";}

            const config: LoggingConfig = await ctx.module.getLoggingConfig(ctx.guild.id);
            const size = config.ignoredRoles.length;
            if(config.ignoredRoles !== []){
                if(config.ignoredRoles.includes(role.id)){
                    const index: number = config.ignoredRoles.indexOf(role.id);
                    config.ignoredRoles.splice(index, 1);
                }else{
                    config.ignoredRoles.push(role.id);
                }
            }else{
                config.ignoredRoles = [role.id];
            }
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {ignoredRoles: config.ignoredRoles});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update ignored logging roles on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            if(config.ignoredRoles.length > size){
                return "Added role to ignored role.";
            }else{
                return "Removed role from ignored role.";
            }
        }

        if(ctx.args[0].toLowerCase() === "enableall"){
            for(const event of eventNames){
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, event, {enabled: true});
                }catch(err){
                    return err.message;
                }
            }
            return "Enabled all events.";
        }

        if(ctx.args[0].toLowerCase() === "alwaysshowage"){
            if(!ctx.args[1]){return {status: "neutral", response: "Please specify yes or no"};}
            const result = Hyperion.utils.input2boolean(ctx.args[1]);
            if(result === undefined){return {status: "error", response: "Please specify a valid setting , try yes or no"};}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {alwaysShowAge: result});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update always show age on ${ctx.guild.id}, error: ${err}`);
                return {status: "error", response: "Something went wrong: " + err.message};
            }
            return {status: "success", response: "Updated Always Show Age Setting"};
        }

        if(ctx.args[0].toLowerCase() === "showpreviouscases"){
            if(!ctx.args[1]){return {status: "neutral", response: "Please specify yes or no"};}
            const result = Hyperion.utils.input2boolean(ctx.args[1]);
            if(result === undefined){return {status: "error", response: "Please specify a valid setting , try yes or no"};}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {prevCasesOnJoin: result});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update prev cases on ${ctx.guild.id}, error: ${err}`);
                return {status: "error", response: "Something went wrong: " + err.message};
            }
            return {status: "success", response: "Updated Show Previous Cases Setting"};
        }

        if(ctx.args[0].toLowerCase() === "disableall"){
            for(const event of eventNames){
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, event, {enabled: false});
                }catch(err){
                    return err.message;
                }
            }
            return "Disabled all events.";
        }

        if(ctx.args[0].toLowerCase() === "showavatar"){
            if(!ctx.args[1]){return "Please specify true/false or yes/no.";}
            const result = Hyperion.utils.input2boolean(ctx.args[1]);
            if(result === undefined){return "Invalid argument, try yes or no.";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {showAvatar: result});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update showAvatar on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated Show Avatars Setting";
        }

        if(ctx.args[0].toLowerCase() === "newaccountage"){
            if(!ctx.args[1]){return "Please specify a number of days.";}
            const result = Number(ctx.args[1]);
            if(isNaN(result) || result < 0 || result > 14){return "Invalid argument, try a number betyween 0 and 14.";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {newAccountAge: Math.floor(result)*86400000});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update new account age on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated New Account Age Setting";
        }

        if(ctx.args[0].toLowerCase() === "ghostreacttime"){
            if(!ctx.args[1]){return "Please specify a time";}
            const result = Number(ctx.args[1]);
            if(isNaN(result) || (result < 1 || result > 15)){return "Invalid time, try a number between 1 and 15";}
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "logging", {ghostreacttime: result});
            }catch(err){
                Hyperion.logger.warn("Hyperion", "Logging Config", `Failed to update ghostreacttime on ${ctx.guild.id}, error: ${err}`);
                return "Something went wrong";
            }
            return "Updated Ghost React time";
        }

        if(LowerCaseEvents.includes(ctx.args[0].toLowerCase()) && !ctx.args[1]){
            const index = LowerCaseEvents.indexOf(ctx.args[0].toLowerCase());
            const eventConfig = await ctx.module.getEventConfig(ctx.guild.id, eventNames[index]);
            const data = {
                embed: {
                    color: Hyperion.colors.default,
                    timestamp: new Date,
                    title: `Settings for ${eventNames[index]}`,
                    description: `**Enabled:** ${eventConfig.enabled}\n**Channel:** ${eventConfig.channel}\n**Ignored Channels:** ${eventConfig.ignoredChannels.length !== 0 ? eventConfig.ignoredChannels.map(c => `<#${c}>`).join(", ") : "None"}\n**Ignored Roles:** ${eventConfig.ignoredRoles.length !== 0 ? eventConfig.ignoredRoles.map(c => `<@&${c}>`).join(", ") : "None"}`
                }
            };
            return data;
        }
        if(LowerCaseEvents.includes(ctx.args[0].toLowerCase()) && ctx.args[1]){
            const index = LowerCaseEvents.indexOf(ctx.args[0].toLowerCase());
            const eventConfig = await ctx.module.getEventConfig( ctx.guild.id, eventNames[index]);
            if(ctx.args[1].toLowerCase() === "enable"){
                if(eventConfig.enabled === true){return "That event is already enabled";}
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {enabled: true});
                    return `Enabled ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            if(ctx.args[1].toLowerCase() === "disable"){
                if(eventConfig.enabled === false){return "That event is already disabled";}
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {enabled: false});
                    return `Disabled ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            if(ctx.args[1].toLowerCase() === "reset"){
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {enabled: false, channel: "default", ignoredRoles: [], ignoredChannels: []});
                    return `Reset settings for ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            if(ctx.args[1].toLowerCase() === "ignoredchannels"){
                if(!ctx.args[2]){return "Please specify a channel";}
                const channel = Hyperion.utils.resolveGuildChannel(ctx.guild, ctx.msg, ctx.args[2])?.id;
                if(!channel){return "I couldnt find that channel";}
                if(eventConfig.ignoredChannels.includes(channel)){
                    const temp = eventConfig.ignoredChannels.indexOf(channel);
                    eventConfig.ignoredChannels = eventConfig.ignoredChannels.splice(temp);
                }else{
                    eventConfig.ignoredChannels.push(channel);
                }
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {ignoredChannels: eventConfig.ignoredChannels});
                    return `Updated ignored channels for ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            if(ctx.args[1].toLowerCase() === "channel"){
                if(!ctx.args[2]){return "Please specify a channel";}
                if(ctx.args[2].toLowerCase() === "default"){
                    try{
                        await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {channel: "default"});
                        return `Set ${eventNames[index]} to use the default log channel`;
                    }catch(err){
                        return err.message;
                    }
                }
                const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[2])?.id;
                if(!channel){return "I couldnt find that channel";}
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {channel: channel});
                    return `Updated channel for ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            if(ctx.args[1].toLowerCase() === "ignoredroles"){
                if(!ctx.args[2]){return "Please specify a role";}
                const role = Hyperion.utils.resolveRole(ctx.args[2], ctx.guild.roles)?.id;
                if(!role){return "I couldnt find that role";}
                if(eventConfig.ignoredRoles.includes(role)){
                    const temp = eventConfig.ignoredRoles.indexOf(role);
                    eventConfig.ignoredRoles = eventConfig.ignoredRoles.splice(temp);
                }else{
                    eventConfig.ignoredRoles.push(role);
                }
                try{
                    await ctx.module.updateLogEvent(ctx.guild.id, eventNames[index], {ignoredRoles: eventConfig.ignoredRoles});
                    return `Updated ignored roles for ${eventNames[index]}`;
                }catch(err){
                    return err.message;
                }
            }
            return "Please specify a valid option";
        }
        return "this should never be reached.";
    }

    async showOverallSettings(ctx: ICommandContext<LoggingModule>, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | string>{
        let config: LoggingConfig = await ctx.module.getLoggingConfig(ctx.guild.id);
        config = new LoggingConfig(config);
        if(!config){return "An error occured";}
        const chanObj = ctx.guild.channels.get(config.logChannel);
        let channelName = "No channel set.";
        if(chanObj){channelName = chanObj.mention;}
        let ignoredChannels= "No ignored channels set.";
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
                color: Hyperion.colors.default,
                timestamp: new Date,
                description: `The current logging settings for the server are:\n**Default Log Channel:** ${channelName}\n**Ignored Channels:** ${ignoredChannels}\n**Show Avatar:** ${showAv}\n**Ghost React Time:** ${config.ghostReactTime} seconds\n**New Account Age:** ${(config.newAccountAge * 86400000) ?? 5} days\n**Always Show Account Age:** ${config.alwaysShowAge ? "Yes" : "No"}\n**Show Previous Cases:** ${config.prevCasesOnJoin ? "Yes" : "No"}`,
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
