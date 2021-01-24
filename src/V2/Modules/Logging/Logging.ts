/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Module} from "../../Structures/Module";
// eslint-disable-next-line no-unused-vars
import {IHyperion, GuildConfig, EmbedResponse} from "../../types";
// eslint-disable-next-line no-unused-vars
import { Guild, Member, User, Message, VoiceChannel, Role, GuildChannel, Emoji, TextChannel, Embed, NewsChannel, StoreChannel, CategoryChannel, Channel } from "eris";
import {LoggingConfig, LogEvent} from "../../Structures/MongoGuildManager";
import {default as msc} from "pretty-ms";
import { modLogType } from "../../../main";

const permMap: {[key: number]: string} = {
    0: "Create Invite",
    1: "Kick Members",
    2: "Ban Members",
    3: "Administrator",
    4: "Manage Channels",
    5: "Manage Server",
    6: "Add Reactions",
    7: "View Audit Logs",
    8: "Priority Speaker",
    9: "Go Live",
    10: "Read Messages",
    11: "Send Messages",
    12: "Send TTS Messages",
    13: "Manage Messages",
    14: "Embed Links",
    15: "Attach Files",
    16: "Read Message History",
    17: "Mention Everyone, Mention Here, Mention All Roles",
    18: "Use External Emotes",
    19: "View Server Insights",
    20: "Voice Connect",
    21: "Voice Speak",
    22: "Mute Members",
    23: "Deafen Members",
    24: "Move Members",
    25: "Use Voice Activity",
    26: "Change Nickname",
    27: "Manage Nicknames",
    28: "Manage Roles",
    29: "Manage Webhooks",
    30: "Manage Emotes"
};
const cNameType: {[key: number]: string} = {
    0: "Text Channel",
    2: "Voice Channel",
    4: "Category",
    5: "Announcement Channel",
    6: "Store Channel"
};
class Logging extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "logging",
            hasCommands: true,
            friendlyName: "Logging",
            dirname: __dirname,
            defaultStatus: true,
            subscribedEvents: [
                "messageDelete",
                "messageUpdate", 
                "messageDeleteBulk", 
                "guildMemberAdd",
                "guildMemberRemove",
                "guildBanAdd",
                "guildBanRemove",
                "guildMemberUpdate",
                "messageReactionAdd",
                "messageReactionRemove",
                "voiceChannelJoin",
                "voiceChannelLeave",
                "voiceChannelSwitch",
                "guildRoleCreate",
                "guildRoleDelete",
                "guildRoleUpdate",
                "channelCreate",
                "channelDelete",
                "channelUpdate"
            ]
        }, Hyperion);
    }

    escapeCodeblock(input: string){
        const rx = new RegExp("```", "gmi");
        // eslint-disable-next-line no-useless-escape
        return input.replace(rx, "\\`\\`\\`");
    }

    async updateLogEvent(guild: string, event: string, updateData: Partial<LogEvent>): Promise<void>{
        const old = await this.getEventConfig(guild, event);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = {};
        update[event] = new LogEvent(this.Hyperion.managers.guild.merge(old, updateData));
        await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, update);
    }

    async getEventConfig(guild: string, eventName: string): Promise<LogEvent>{
        const data = await this.getLoggingConfig(guild);
        if(!data[eventName]){return new LogEvent({});}
        return new LogEvent(data[eventName]);
    }

    async getLoggingConfig(guild: string): Promise<LoggingConfig>{
        return await this.Hyperion.managers.guild.getModuleConfig<LoggingConfig>(guild, this.name);
    }

    async preCheck(guild: Guild, eventName: string, roles?: Array<string>, channel?: string | Array<string>): Promise<boolean>{
        if(this.Hyperion.global === undefined){return false;}
        if(!await this.checkGuildEnabled(guild.id)){return false;}
        const econfig = await this.getEventConfig(guild.id, eventName);
        if(!econfig){return false;}
        if(econfig.enabled === false){return false;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);
        if(roles){
            if(config?.ignoredRoles?.some((r: string) => roles.indexOf(r) >= 0)){return false;}
            if(econfig?.ignoredRoles?.some((r: string) => roles.indexOf(r) >= 0)){return false;}
        }
        if(channel && channel.length === undefined){
            if(config?.ignoredChannels?.includes(channel as string)){return false;}
            if(econfig?.ignoredChannels?.includes(channel as string)){return false;}
        }
        if(channel && channel.length !== undefined){
            if(config?.ignoredChannels?.some((c: string) => channel.indexOf(c) >= 0)){return false;}
            if(econfig?.ignoredChannels?.some((c: string) => channel.indexOf(c) >= 0)){return false;}
        }
        return true;
    }

    async testChannel( guild: Guild, eventName: string): Promise<TextChannel|undefined>{
        const econfig = await this.getEventConfig(guild.id, eventName);
        if(!econfig?.channel){return;}
        let channel: string = econfig.channel;
        if(channel === "default"){
            const config: LoggingConfig = await this.getLoggingConfig(guild.id);
            if(!config){return;}
            channel = config?.logChannel;
            if(!channel){return;}
        }
        const chanObj = guild.channels.get(channel);
        if(!(chanObj?.type === 0)){return;}
        return chanObj;
    }

    //GUILD MEMBER
    async guildMemberAdd(...args: [Guild, Member]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        if(!await this.preCheck(guild, "memberAdd", undefined, undefined)){return;}
        const channelObj = await this.testChannel( guild, "memberAdd");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Join",
                color: this.Hyperion.colors.green,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `${member.mention} - ${member.username}#${member.discriminator}`,
                fields: []
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        if(!config.alwaysShowAge && config.newAccountAge > 0 && ((Date.now() - member.createdAt) < config.newAccountAge)){
            data.embed.fields!.push({name: "__New Account__", value: `**Created ${msc(Date.now() - member.createdAt)} ago**`});
        }
        if(config.alwaysShowAge){
            data.embed.fields!.push({name: "Account Age", value: `Account created ${msc(Date.now() - member.createdAt)} ago`});
        }
        if(config.prevCasesOnJoin){
            const cases: null | Array<modLogType> = await this.Hyperion.managers.modlog.raw().find({guild: guild.id, user: member.id}).sort({caseNumber: -1}).limit(30).lean<modLogType>().exec();
            if(cases && cases.length > 0){
                data.embed.fields!.push({name: "Previous Cases", value: cases.map(c => c.caseNumber).join(", ")});
            }
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member join, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberRemove(...args: [Guild, Member | any]): Promise<void | undefined>{
        const guild = args[0];
        let member = args[1];
        if(!await this.preCheck(guild, "memberRemove", undefined, undefined)){return;}
        const channelObj = await this.testChannel(guild, "memberRemove");
        if(!channelObj){return;}
        if(member.bot === undefined){member = (await this.Hyperion.client.getRESTUser(member.id)) as unknown as Member;}
        if(await this.Hyperion.redis.get(`${guild.id}:${member.id}:banAdd`) !== null){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Leave",
                color: this.Hyperion.colors.red,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `${member.mention} - ${member.username}#${member.discriminator}`
            }
        };

        if(config.showAvatar && member.avatarURL){
            data.embed.thumbnail = {url: member.avatarURL};
        }
        if((member.roles ?? []).length !== 0){
            data.embed.fields = [{name: "Previous Roles", value: member.roles.map((r: string) => guild.roles.get(r)?.name ?? "Unknown Role").join(", "), inline: false}];
        }


        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member leave, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberUpdate(...args: [Guild, Member, any]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const oldMember = args[2];
        if(!oldMember || (!oldMember.nick && !oldMember.roles)){return;}
        if(member.roles !== oldMember.roles){this.guildMemberRolesUpdate(guild, member, oldMember);}
        if(member.nick !== oldMember.nick){this.guildMemberNickUpdate(guild, member, oldMember);}
    }

    async guildBanAdd(...args: [Guild, User]): Promise<void | undefined>{
        const guild = args[0];
        const user = args[1];
        if(!await this.preCheck(guild, "banAdd", undefined, undefined)){return;}
        this.Hyperion.redis.set(`${guild.id}:${user.id}:banAdd`, "yes", "EX", 5);
        const channelObj = await this.testChannel(guild, "banAdd");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Banned",
                color: this.Hyperion.colors.red,
                footer: {
                    text: `ID: ${user.id}`
                },
                timestamp: new Date,
                description: `${user.mention} - ${user.username}#${user.discriminator}`
            }
        };

        if(config.showAvatar && user.avatarURL){
            data.embed.thumbnail = {url: user.avatarURL};
        }


        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for ban add, ${err}`, "Logging");
        }
    }

    async guildBanRemove(...args: [Guild, User]): Promise<void | undefined>{
        const guild = args[0];
        const user = args[1];
        if(!await this.preCheck(guild, "banRemove", undefined, undefined)){return;}
        const channelObj = await this.testChannel(guild, "banRemove");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig( guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Unbanned",
                color: this.Hyperion.colors.blue,
                footer: {
                    text: `ID: ${user.id}`
                },
                timestamp: new Date,
                description: `${user.mention} - ${user.username}#${user.discriminator}`
            }
        };

        if(config.showAvatar && user.avatarURL){
            data.embed.thumbnail = {url: user.avatarURL};
        }


        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for ban remove, ${err}`, "Logging");
        }
    }

    //MESSGAES
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageDelete(...args: [Message | any]): Promise<void | undefined>{
        const msg = args[0];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author && msg.author.bot){return;}
        const guild = msg.channel.guild;
        if(!await this.preCheck(guild, "messageDelete", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel( guild, "messageDelete");
        if(!channelObj){return;}
        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                timestamp: new Date,
                title: "Message Delete Log",
                footer: {
                    text: `Message ID: ${msg.id}`
                },
                color: this.Hyperion.colors.red,
                description: `Message sent in ${msg.channel.mention} was deleted`,
                fields: field
            }
        };
        if(msg.author){
            data.embed.fields.push({
                name: "Author Info",
                value: `${msg.author.mention} - ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                inline: false
            });
        }else{
            data.embed.fields.push({
                name: "Author Info",
                value: "I couldnt figure out who made the message",
                inline: false
            });
        }
        if(msg?.cleanContent){msg.content = msg.cleanContent;}
        if(msg.content){
            if(msg.content.length > 1000){
                data.embed.fields.push({
                    name: "Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(msg.content.substring(0, 1001))}...\n\`\`\``,
                    inline: false
                });
            }else{
                data.embed.fields.push({
                    name: "Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(msg.content)}\n\`\`\``,
                    inline: false
                });
            }
        }else{
            if(msg.attachments && msg.attachments[0]){
                data.embed.fields.push({
                    name: "Message Content",
                    value: "The message had no content",
                    inline: false
                });
            }else{
                data.embed.fields.push({
                    name: "Message Content",
                    value: "I couldnt figure out what that message said",
                    inline: false
                });
            }
        }
        if(msg.attachments){
            if(msg.attachments.length > 1){
                data.embed.fields.push({
                    name: "Message Attachments",
                    value: "The message had multiple attachments",
                    inline: false
                });
            }
            if(msg.attachments[0] && msg.attachments[0].url && (msg.attachments[0].url.endsWith("png") || msg.attachments[0].url.endsWith("jpg"))){
                data.embed.fields.push({
                    name: "Message Attachments",
                    value: "The message had an image",
                    inline: false
                });
            }
            if(msg.attachments[0] && msg.attachments[0].url && msg.attachments[0].url.endsWith("gif")){
                data.embed.fields.push({
                    name: "Message Attachments",
                    value: "The message had a gif",
                    inline: false
                });
            }
        }

        if(await this.Hyperion.redis.get(`Deleted:${msg.id}`) !== null){
            data.embed.description += "\nThis message was deleted by Hyperion";
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for message delete, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageUpdate(...args: [Message | any, any]): Promise<void | undefined>{
        const msg = args[0];
        const oldMessage = args[1];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author && msg.author.bot){return;}
        const guild = msg.channel.guild;
        if(!oldMessage?.content){return;}
        if(msg.content === oldMessage?.content){return;}
        if(!await this.preCheck(guild, "messageEdit", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(guild, "messageEdit");
        if(!channelObj){return;}
        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                timestamp: new Date,
                title: "Message Edit Log",
                footer: {
                    text: `Message ID: ${msg.id}`
                },
                color: this.Hyperion.colors.orange,
                description: `Message sent in ${msg.channel.mention} was edited`,
                fields: field
            }
        };
        if(msg.author){
            data.embed.fields.push({
                name: "Author Info",
                value: `${msg.author.mention} - ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                inline: false
            });
        }else{
            data.embed.fields.push({
                name: "Author Info",
                value: "I couldnt figure out who made the message",
                inline: false
            });
        }
        if(oldMessage?.cleanContent){oldMessage.content = oldMessage.cleanContent;}
        if(oldMessage?.content){
            if(oldMessage?.content.length > 1000){
                data.embed.fields.push({
                    name: "Old Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(oldMessage?.content.substring(0, 1001))}...\n\`\`\``,
                    inline: false
                });
            }else{
                data.embed.fields.push({
                    name: "Old Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(oldMessage?.content)}\n\`\`\``,
                    inline: false
                });
            }
        }else{
            data.embed.fields.push({
                name: " Old Message Content",
                value: "I couldnt figure out what that message originally said",
                inline: false
            });
        }
        if(msg.content === undefined || msg.content === ""){
            data.embed.fields.push({
                name: "New Message Content",
                value: "The new message had no content",
                inline: false
            });
        }else{
            if(msg.content.length > 1000){
                data.embed.fields.push({
                    name: "New Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(msg.cleanContent.substring(0, 1001))}...\n\`\`\``,
                    inline: false
                });
            }else{
                data.embed.fields.push({
                    name: "New Message Content",
                    value: `\`\`\`\n${this.escapeCodeblock(msg.cleanContent)}\n\`\`\``,
                    inline: false
                });
            }
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for message edit, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageDeleteBulk(...args: [Array<Message | any>]): Promise<void | undefined>{
        const messages = args[0];
        const msg = messages[0];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const guild = msg.channel.guild;
        if(!await this.preCheck(guild, "bulkDelete", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(guild, "bulkDelete");
        if(!channelObj){return;}

        const data = {
            embed: {
                color: this.Hyperion.colors.red,
                timestamp: new Date,
                title: "Bulk Delete Log",
                description: `Bulk Delete in ${msg.channel.mention}, ${messages.length} messages deleted`
            }
        };

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for message delete, ${err}`, "Logging");
        }
    }

    //VOICE
    async voiceChannelJoin(...args: [Member, VoiceChannel]): Promise<void | undefined>{
        const member = args[0];
        const channel = args[1];
        const guild = member.guild;
        if(!await this.preCheck(guild, "voiceJoin", member.roles, channel.id)){return;}
        const channelObj = await this.testChannel(guild, "voiceJoin");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.green,
                timestamp: new Date,
                title: "Voice Channel Join",
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Channel Joined:** ${channel.name}`
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for voice join, ${err}`, "Logging");
        }
    }

    async voiceChannelLeave(...args: [Member, VoiceChannel]): Promise<void | undefined>{
        const member = args[0];
        const channel = args[1];
        const guild = member.guild;
        if(!await this.preCheck(guild, "voiceLeave", member.roles, channel.id)){return;}
        const channelObj = await this.testChannel(guild, "voiceLeave");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.orange,
                timestamp: new Date,
                title: "Voice Channel Leave",
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Channel Left:** ${channel.name}`
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for voice leave, ${err}`, "Logging");
        }
    }

    async voiceChannelSwitch(...args: [Member, VoiceChannel, VoiceChannel]): Promise<void | undefined>{
        const member = args[0];
        const newChannel = args[1];
        const oldChannel = args[2];
        const guild = member.guild;
        if(!await this.preCheck(guild, "voiceJoin", member.roles, [oldChannel.id, newChannel.id])){return;}
        const channelObj = await this.testChannel( guild, "voiceJoin");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig( guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.blue,
                timestamp: new Date,
                title: "Voice Channel Switch",
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Channel Left:** ${oldChannel.name}\n**Channel Joined:** ${newChannel.name}`
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for voice switch, ${err}`, "Logging");
        }
    }

    permsToName(perms: number): Array<string>{
        const out: Array<string> = [];
        if((perms & (1 << 3)) === (1 << 3)){return ["Administrator"];}
        for(let i = 0; i < 31; i++){
            if((perms & (1 << i)) === (1 << i)){out.push(permMap[i]);}
        }
        if(out.length === 0){return ["None"];}
        return out;
    }
    //ROLE
    async guildRoleCreate(...args: [Guild, Role]): Promise<void | undefined>{
        const guild = args[0];
        const role = args[1];
        if(!await this.preCheck(guild, "roleAdd")){return;}
        const channelObj = await this.testChannel(guild, "roleAdd");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.green,
                timestamp: new Date,
                title: "Role Created",
                description: `**Name:** ${role.name}\n**Position:** ${role.position}\n**Hoisted:** ${role.hoist ? "Yes" : "No"}\n**Mentionable:** ${role.mentionable ? "Yes" : "No"}\n**Managed:** ${role.managed ? "Yes" : "No"}\n**Color:** #${role.color.toString(16)}`,
                fields: [{name: "Permissions", value: this.permsToName(role.permissions.allow).join(", "), inline: false}],
                footer: {text: `Role ID: ${role.id}`}
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    async guildRoleDelete(...args: [Guild, Role]): Promise<void | undefined>{
        const guild = args[0];
        const role = args[1];
        if(!await this.preCheck( guild, "roleDelete")){return;}
        const channelObj = await this.testChannel(guild, "roleDelete");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.red,
                timestamp: new Date,
                title: "Role Deleted",
                description: `**Name:** ${role.name}\n**Position:** ${role.position}\n**Hoisted:** ${role.hoist ? "Yes" : "No"}\n**Mentionable:** ${role.mentionable ? "Yes" : "No"}\n**Managed:** ${role.managed ? "Yes" : "No"}\n**Color:** #${role.color.toString(16)}`,
                fields: [{name: "Permissions", value: this.permsToName(role.permissions.allow).join(", "), inline: false}],
                footer: {text: `Role ID: ${role.id}`}
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildRoleUpdate(...args: [Guild, Role, any]): Promise<void | undefined>{
        const guild = args[0];
        const role = args[1];
        const oldRole = args[2];
        if(!await this.preCheck(guild, "roleUpdate")){return;}
        const channelObj = await this.testChannel(guild, "roleUpdate");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig( guild.id);
        let changes = false;
        for(const key of Object.keys(oldRole)){
            if(key === "position"){continue;}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
        
            if(oldRole[key] !== undefined && role[key] !== undefined && oldRole[key] !== role[key]){

                if(key === "permissions"){
                    if(oldRole.permissions.allow === role.permissions.allow){continue;}
                }
                changes = true;
                break;
            }
        }
        if(!changes){return;}
        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.blue,
                timestamp: new Date,
                title: "Role Updated",
                footer: {text: `Role ID: ${role.id}`},
                fields: [],
                description: ""
                
            }
        };
        if(oldRole.name !== undefined && role.name !== oldRole.name){
            data.embed.description += `**Old Name:** ${oldRole.name}\n**New Name:** ${role.name}\n\n`;
        }else{
            data.embed.description += `**Role Name:** ${role.name}\n`;
        }

        if(oldRole.color !== undefined && role.color !== oldRole.color){
            data.embed.description += `**Old Color:** ${oldRole.color.toString(16)}\n**New Color:** ${role.color.toString(16)}\n\n`;
        }
        if(oldRole.hoist !== undefined && role.hoist !== oldRole.hoist){
            data.embed.description += `**Old Hoist Status:** ${oldRole.hoist ? "Yes" : "No"}\n**New Hoist Status:** ${role.hoist ? "Yes" : "No"}\n\n`;
        }
        if(oldRole.mentionable !== undefined && role.mentionable !== oldRole.mentionable){
            data.embed.description += `**Old Mentionable Status:** ${oldRole.mentionable ? "Yes" : "No"}\n**New Mentionable Status:** ${role.mentionable ? "Yes" : "No"}\n`;
        }
        if(oldRole.permissions !== undefined && oldRole.permissions.allow !== role.permissions.allow){
            const old = this.permsToName(oldRole.permissions.allow);
            const newPerms = this.permsToName(role.permissions.allow);
            data.embed.fields?.push({name: "Old Permissions", value: old.join(", ")});
            data.embed.fields?.push({name: "New Permissions", value: newPerms.join(", ")});
            const added = [];
            const removed = [];
            for(const perm of old){
                if(!newPerms.includes(perm)){removed.push(perm);}
            }
            for(const perm of newPerms){
                if(!old.includes(perm)){added.push(perm);}
            }
            if(added.length > 0){
                data.embed.fields?.push({name: "Permissions Added", value: added.join(", ")});
            }
            if(removed.length > 0){
                data.embed.fields?.push({name: "Permissions Removed", value: removed.join(", ")});
            }
        }

        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }
        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    //CHANNEL
    async channelCreate(...args: [GuildChannel]): Promise<void | undefined>{
        const channel = args[0];
        if(!channel.guild){return;}
        const guild = channel.guild;
        if(!(await this.preCheck(guild, "channelAdd"))){return;}
        const channelObj = await this.testChannel(guild, "channelAdd");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.green,
                timestamp: new Date,
                title: `${cNameType[channel.type] ?? "Unknwon"} Created`,
                description: `**Name:** ${channel.name}\n**Position:** ${channel.position}\n`,
                footer: {text: `Channel ID: ${channel.id}`}
            }
        };
        if(!(channel.type === 4 || channel.type === 2)){data.embed.description += `**Mention:** ${channel.mention}\n`;}
        if(channel.type !== 4){
            if(channel.parentID){
                data.embed.description += `**Category:** ${guild.channels.get(channel.parentID)?.name ?? "Unknown"}\n`;
            }else{
                data.embed.description += "**Category:** None\n";
            }
        }
        if(channel.type === 0 || channel.type === 5){
            if((channel as TextChannel).topic){
                data.embed.fields = [{name: "Channel Topic", value: (channel as TextChannel).topic!}];
                if((channel as TextChannel).rateLimitPerUser){data.embed.description += `**Slowmode:** ${(channel as TextChannel).rateLimitPerUser} seconds\n`;}
            }
        }
        if(channel.type === 2){
            const nchannel = channel as VoiceChannel;
            if(nchannel.userLimit !== undefined){
                data.embed.description += `**User Limit:** ${nchannel.userLimit || "Unlimited"} users\n`;
            }
            if(nchannel.bitrate !== undefined){
                data.embed.description += `**Bitrate:** ${nchannel.bitrate/1000}kbps\n`;
            }
        }
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }
        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for channel add, ${err}`, "Logging");
        }
    }

    async channelDelete(...args: [GuildChannel]): Promise<void | undefined>{
        const channel = args[0];
        if(!channel.guild){return;}
        const guild = channel.guild;
        if(!await this.preCheck(guild, "channelDelete")){return;}
        const channelObj = await this.testChannel(guild, "channelDelete");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.red,
                timestamp: new Date,
                title: `${cNameType[channel.type] ?? "Unknwon"} Deleted`,
                description: `**Name:** ${channel.name}\n**Position:** ${channel.position}\n`,
                footer: {text: `Channel ID: ${channel.id}`}
            }
        };
        if(channel.type !== 4){
            if(channel.parentID){
                data.embed.description += `**Category:** ${guild.channels.get(channel.parentID)?.name ?? "Unknown"}\n`;
            }else{
                data.embed.description += "**Category:** None\n";
            }
        }
        if(channel.type === 0 || channel.type === 5){
            if((channel as TextChannel).topic){
                data.embed.fields = [{name: "Channel Topic", value: (channel as TextChannel).topic!}];
                if((channel as TextChannel).rateLimitPerUser){data.embed.description += `**Slowmode:** ${(channel as TextChannel).rateLimitPerUser} seconds\n`;}
            }
        }

        if(channel.type === 2){
            const nchannel = channel as VoiceChannel;
            if(nchannel.userLimit !== undefined){
                data.embed.description += `**User Limit:** ${nchannel.userLimit || "Unlimited"} users\n`;
            }
            if(nchannel.bitrate !== undefined){
                data.embed.description += `**Bitrate:** ${nchannel.bitrate/1000}kbps\n`;
            }
        }
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }


        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for channel delete, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async channelUpdate(...args: [GuildChannel, any]): Promise<void | undefined>{
        const channel = args[0];
        if(!channel.guild){return;}
        const guild = channel.guild;
        const oldChannel = args[1];
        if(!await this.preCheck(guild, "roleUpdate")){return;}
        const channelObj = await this.testChannel(guild, "roleUpdate");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        let changes = false;
        let permUpdate = false;
        for(const key of Object.keys(oldChannel)){
            if(key === "position"){continue;}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            if(oldChannel[key] !== undefined && channel[key] !== undefined && oldChannel[key] !== channel[key]){
                if(key === "permissionOverwrites"){
                    permUpdate = true;
                }else{
                    changes = true;
                }
            }
        }

        //if(permUpdate){return;}//will be perm update later
        if(!changes){return;}
        const data: EmbedResponse = {
            embed: {
                color: this.Hyperion.colors.blue,
                timestamp: new Date,
                title: "Channel Updated",
                description: "",
                footer: {text: `Channel ID: ${channel.id}`}
            }
        };

        if(oldChannel.parentID && oldChannel.parentID !== channel.parentID){
            data.embed.description += `**Old Category:** ${oldChannel.parentID !== null ? guild.channels.get(oldChannel.parentID)?.name ?? "Unknown" : "No Category"}\n**New Category:** ${channel.parentID !== null ? guild.channels.get(channel.parentID!)?.name ?? "Unknown" : "No Category"}\n\n`;
        }
        if(oldChannel.name !== channel.name){
            data.embed.description += `**Old Name:** ${oldChannel.name}\n**New Name:** ${channel.name}\n\n`;
        }else{
            if(channel.type !== 2 && channel.type !== 4){data.embed.description = `**Channel Mention:** ${channel.mention}\n` + (data.embed.description ?? "");}else{data.embed.description = `**Channel Name:** ${channel.name}\n` + (data.embed.description ?? "");}
        }
        if(oldChannel.type === channel.type){
            if(channel.type === 5 || channel.type === 0){
                if(oldChannel.topic !== (channel as TextChannel).topic){data.embed.description += `**Old Topic:** ${oldChannel.topic ?? "None"}\n**New Topic:** ${(channel as TextChannel).topic ?? "None"}\n\n`;}
                if(oldChannel.rateLimitPerUser !== (channel as TextChannel).rateLimitPerUser){data.embed.description += `**Old Slowmode:** ${oldChannel.rateLimitPerUser ?? "0"} seconds\n**New Slowmode:** ${(channel as TextChannel).rateLimitPerUser ?? "0"} seconds\n\n`;}
            }
            if(channel.type === 2){
                if((channel as VoiceChannel).bitrate !== oldChannel?.bitrate){
                    data.embed.description += `**Old Bitrate:** ${oldChannel.bitrate ? `${oldChannel.bitrate/1000}kbps` : "Unknown"}\n**New Bitrate:** ${(channel as VoiceChannel).bitrate ? `${(channel as VoiceChannel).bitrate!/1000}kbps` : "Unknown"}\n\n`;
                }
                if((channel as VoiceChannel).userLimit !== oldChannel?.userLimit && oldChannel.userLimit !== undefined){
                    data.embed.description += `**Old User Limit:** ${oldChannel.userLimit ?? "Unlimited"} users\n**New User Limit:** ${(channel as VoiceChannel).userLimit ?? "Unlimited"} users\n\n`;
                }
            }
        }else{
            data.embed.description += `**Old Channel Type:** ${cNameType[oldChannel.type] ?? "Unknown"}\n**New Channel Type:** ${cNameType[channel.type] ?? "Unknown"}`;
        }
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL!};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for channel update, ${err}`, "Logging");
        }

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async channelPermsUpdate(guild: Guild, channel: GuildChannel, oldChannel: any): Promise<void | undefined>{
        
    }

    //MISC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async webhooksUpdate(Hyperion: IHyperion, data: any, channelID: string, guildID: string): Promise<void | undefined>{

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildUpdate(Hyperion: IHyperion, guild: Guild, oldGuild: any): Promise<void | undefined>{

    }
    //REACTIONS
    async messageReactionAdd(...args: [Message, Emoji, Member | {id: string}]): Promise<void | undefined>{
        const msg = args[0];
        const emote = args[1];
        const userID = args[2].id;
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.getLoggingConfig(guild.id);
        if(!config.ghostReact.enabled){return;}
        this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:name`, emote.name, "EX", config.ghostReactTime);
        this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:time`, Date.now(), "EX", config.ghostReactTime);
        if(emote.animated){
            this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:animated`, 1, "EX", config.ghostReactTime);
        }
    }

    async messageReactionRemove(...args: [Message, Emoji, string]): Promise<void | undefined>{
        const msg = args[0];
        const emote = args[1];
        const userID = args[2];
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.getLoggingConfig(guild.id);
        if(!config.ghostReact.enabled){return;}
        if(await this.Hyperion.redis.exists(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:name`)){
            this.ghostReact(guild, msg, userID, {
                name: emote.name,
                id: emote.id,
                animated: await this.Hyperion.redis.exists(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:animated`) === 1 ? true : false,
                time: Number(await this.Hyperion.redis.get(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:time`)) ?? 0
            });
        }
    }

    async messageReactionRemoveAll(Hyperion: IHyperion, msg: Message): Promise<void | undefined>{
        
    }

    //CUSTOM
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async system(Hyperion: IHyperion, message: any): Promise<void | undefined>{

    }

    async ghostReact(guild: Guild, msg: Message, userID: string, emote: {name: string; id: string; animated: boolean; time: number}): Promise<void | undefined>{
        const member = guild.members.get(userID) ?? (await guild.fetchMembers({query: userID}).then(m => m[0]), () => {}) as unknown as Member;
        if(!member){return;}
        if(!await this.preCheck(guild, "ghostReact", member.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(guild, "ghostReact");
        if(!channelObj){return;}

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Ghost React",
                color: this.Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}
                (${member.id})
                **Emote Name:** ${emote.name}
                **Message:** [Jump](https://discordapp.com/channels/${guild.id}/${msg.channel.id}/${msg.id})`,
                thumbnail: {
                    url: `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? "gif" : "png"}?v=1`
                }
            }
        };
        if(emote.time !== 0 && !isNaN(emote.time)){
            data.embed.description += `\nThe emote was there for ${msc(Date.now() - emote.time)}`;
        }else{
            data.embed.description += "I couldnt figure out how long the emote was there";
        }
        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for ghost react, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberRolesUpdate(...args: [Guild, Member, any]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const oldMember = args[2];
        const addedRoles: Array<string> = [];
        const removedRoles: Array<string> = [];
        member.roles.forEach(r => {
            if(!oldMember.roles.includes(r)){addedRoles.push(r);}
        });
        oldMember.roles.forEach((r: string) => {
            if(!member.roles.includes(r)){removedRoles.push(r);}
        });
        if(addedRoles.length !== 0 && removedRoles.length !== 0){return this.memberRoleUpdate(guild, member, addedRoles, removedRoles);}
        if(addedRoles.length !== 0 && removedRoles.length === 0){return this.memberRoleAdd(guild, member, addedRoles);}
        if(addedRoles.length === 0 && removedRoles.length !== 0){return this.memberRoleRemove(guild, member, removedRoles);}
    }
    
    async memberRoleAdd(...args: [Guild, Member, Array<string>]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const roles = args[2];
        if(!await this.preCheck(guild, "memberRoleAdd", roles, undefined)){return;}
        const channelObj = await this.testChannel(guild, "memberRoleAdd");
        if(!channelObj){return;}
        let sorted = this.Hyperion.utils.sortRoles(roles ?? [], guild.roles).map(r => r.id);
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);
        sorted = sorted.map(r => `${guild.roles.get(r)?.name ?? "Unknown"} - <@&${r}>`);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Add",
                color: this.Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Added**\n${sorted.join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member role add, ${err}`, "Logging");
        }
    }

    async memberRoleRemove(...args: [Guild, Member, Array<string>]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const roles = args[2];
        if(!await this.preCheck(guild, "memberRoleRemove", roles, undefined)){return;}
        const channelObj = await this.testChannel(guild, "memberRoleRemove");
        if(!channelObj){return;}
        let sorted = this.Hyperion.utils.sortRoles(roles ?? [], guild.roles).map(r => r.id);
        if(sorted.length !== roles.length){
            for(const role of roles){
                if(!sorted.includes(role)){sorted.push(role);}
            }
        }
        sorted = sorted.map(r => `${guild.roles.get(r)?.name ?? "Unknown"} - <@&${r}>`);
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Remove",
                color: this.Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Removed**\n${sorted.join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member role remove, ${err}`, "Logging");
        }
    }

    async memberRoleUpdate(...args: [Guild, Member, Array<string>, Array<string>]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const rolesAdded = args[2];
        const rolesRemoved = args[3];
        if(!await this.preCheck(guild, "memberRoleUpdate", rolesAdded, undefined)){return;}
        const channelObj = await this.testChannel(guild, "memberRoleUpdate");
        if(!channelObj){return;}
        let sortedAdd = this.Hyperion.utils.sortRoles(rolesAdded ?? [], guild.roles).map(r => r.id);
        let sortedRemove = this.Hyperion.utils.sortRoles(rolesRemoved ?? [], guild.roles).map(r => r.id);
        sortedAdd = sortedAdd.map(r => `${guild.roles.get(r)?.name ?? "Unknown"} - <@&${r}>`);
        sortedRemove = sortedRemove.map(r => `${guild.roles.get(r)?.name ?? "Unknown"} - <@&${r}>`);
        const config: LoggingConfig = await this.getLoggingConfig(guild.id);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Update",
                color: this.Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Added**\n${sortedAdd.join("\n")}\n**Roles Removed**\n${sortedRemove.join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member role remove, ${err}`, "Logging");
        }
    }

    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberNickUpdate(...args: [Guild, Member, any]): Promise<void | undefined>{
        const guild = args[0];
        const member = args[1];
        const oldMember = args[2];
        if(!await this.preCheck(guild, "memberNicknameChange", undefined, undefined)){return;}
        const channelObj = await this.testChannel(guild, "memberNicknameChange");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(guild.id);

        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Nickname update",
                color: this.Hyperion.colors.default,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})`,
                fields: field
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }
        
        if(member.nick === null && oldMember.nick !== null){
            data.embed.fields?.push({
                name: "Old Nickname",
                value: `${oldMember.nick}`,
                inline: false
            });

            data.embed.fields?.push({
                name: "New Nickname",
                value: "None",
                inline: false
            });
        }

        if(member.nick !== null && oldMember.nick === null){
            data.embed.fields?.push({
                name: "Old Nickname",
                value: "None",
                inline: false
            });

            data.embed.fields?.push({
                name: "New Nickname",
                value: `${member.nick}`,
                inline: false
            });
        }

        if(member.nick !== null && oldMember.nick !== null){
            data.embed.fields?.push({
                name: "Old Nickname",
                value: `${oldMember.nick}`,
                inline: false
            });

            data.embed.fields?.push({
                name: "New Nickname",
                value: `${member.nick}`,
                inline: false
            });
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Failed to post log for member nickname change, ${err}`, "Logging");
        }
    }
}

export default Logging;
