/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Module} from "../../Core/Structures/Module";
// eslint-disable-next-line no-unused-vars
import {IHyperion, GuildConfig, EmbedResponse} from "../../types";
// eslint-disable-next-line no-unused-vars
import { Guild, Member, User, Message, VoiceChannel, Role, GuildChannel, Emoji, TextChannel, Embed, NewsChannel, StoreChannel, CategoryChannel, Channel } from "eris";
import {LoggingConfig, LogEvent} from "../../Core/Managers/MongoGuildManager";
import {default as msc} from "pretty-ms";
import { IGuild } from "../../MongoDB/Guild";
import HyperionC from "../../main";
import {inspect} from "util";

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
            defaultStatus: false,
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

    async updateLogEvent(Hyperion: IHyperion, guild: string, event: string, updateData: Partial<LogEvent>): Promise<void>{
        const old = await this.getEventConfig(Hyperion, guild, event);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = {};
        update[event] = new LogEvent(Hyperion.managers.guild.merge(old, updateData));
        await Hyperion.managers.guild.updateModuleConfig(guild, this.name, update);
    }

    async getEventConfig(Hyperion: IHyperion, guild: string, eventName: string): Promise<LogEvent>{
        const data = await this.getLoggingConfig(Hyperion, guild);
        if(!data[eventName]){return new LogEvent({});}
        return new LogEvent(data[eventName]);
    }

    async getLoggingConfig(Hyperion: IHyperion, guild: string): Promise<LoggingConfig>{
        return await Hyperion.managers.guild.getModuleConfig<LoggingConfig>(guild, this.name);
    }

    async preCheck(Hyperion: IHyperion, guild: Guild, eventName: string, roles?: Array<string>, channel?: string | Array<string>): Promise<boolean>{
        if(!await this.checkGuildEnabled(guild.id)){return false;}
        const econfig = await this.getEventConfig(Hyperion, guild.id, eventName);
        if(!econfig){return false;}
        if(econfig.enabled === false){return false;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
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

    async testChannel(Hyperion: IHyperion, guild: Guild, eventName: string): Promise<TextChannel|undefined>{
        const econfig = await this.getEventConfig(Hyperion, guild.id, eventName);
        if(!econfig?.channel){return;}
        let channel: string = econfig.channel;
        if(channel === "default"){
            const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
            if(!config){return;}
            channel = config?.logChannel;
            if(!channel){return;}
        }
        const chanObj = guild.channels.get(channel);
        if(!(chanObj?.type === 0)){return;}
        return chanObj;
    }

    //GUILD MEMBER
    async guildMemberAdd(Hyperion: IHyperion, guild: Guild, member: Member): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberAdd", undefined, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberAdd");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Join",
                color: Hyperion.colors.green,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `${member.mention} - ${member.username}#${member.discriminator}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        if(config.newAccountAge > 0 && ((Date.now() - member.createdAt) < config.newAccountAge)){
            data.embed.description += `\n\n**New Account: Created ${msc(Date.now() - member.createdAt)} ago**`;
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for member join, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberRemove(Hyperion: IHyperion, guild: Guild, member: Member | any): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberRemove", undefined, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberRemove");
        if(!channelObj){return;}
        if(member.bot === undefined){member = (await Hyperion.client.getRESTUser(member.id)) as unknown as Member;}
        if(await Hyperion.redis.get(`${guild.id}:${member.id}:banAdd`) !== null){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Leave",
                color: Hyperion.colors.red,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for member leave, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberUpdate(Hyperion: IHyperion, guild: Guild, member: Member, oldMember: any): Promise<void | undefined>{
        if(!oldMember || (!oldMember.nick && !oldMember.roles)){return;}
        if(member.roles !== oldMember.roles){this.guildMemberRolesUpdate(Hyperion, guild, member, oldMember);}
        if(member.nick !== oldMember.nick){this.guildMemberNickUpdate(Hyperion, guild, member, oldMember);}
    }

    async guildBanAdd(Hyperion: IHyperion, guild: Guild, user: User): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "banAdd", undefined, undefined)){return;}
        Hyperion.redis.set(`${guild.id}:${user.id}:banAdd`, "yes", "EX", 5);
        const channelObj = await this.testChannel(Hyperion, guild, "banAdd");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Banned",
                color: Hyperion.colors.red,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for ban add, ${err}`, "Logging");
        }
    }

    async guildBanRemove(Hyperion: IHyperion, guild: Guild, user: User): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "banRemove", undefined, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "banRemove");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Unbanned",
                color: Hyperion.colors.blue,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for ban remove, ${err}`, "Logging");
        }
    }

    //MESSGAES
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageDelete(Hyperion: IHyperion, msg: Message | any): Promise<void | undefined>{
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author && msg.author.bot){return;}
        const guild = msg.channel.guild;
        if(!await this.preCheck(Hyperion, guild, "messageDelete", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "messageDelete");
        if(!channelObj){return;}
        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                timestamp: new Date,
                title: "Message Delete Log",
                footer: {
                    text: `Message ID: ${msg.id}`
                },
                color: Hyperion.colors.red,
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

        if(await Hyperion.redis.get(`Deleted:${msg.id}`) !== null){
            data.embed.description += "\nThis message was deleted by Hyperion";
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for message delete, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageUpdate(Hyperion: IHyperion, msg: Message | any, oldMessage: any): Promise<void | undefined>{
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author && msg.author.bot){return;}
        const guild = msg.channel.guild;

        if(oldMessage?.embeds){
            if(!oldMessage.embeds[0] && msg.embeds[0]){return;}
        }
        if(!await this.preCheck(Hyperion, guild, "messageEdit", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "messageEdit");
        if(!channelObj){return;}
        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                timestamp: new Date,
                title: "Message Edit Log",
                footer: {
                    text: `Message ID: ${msg.id}`
                },
                color: Hyperion.colors.orange,
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
        if(msg.content === undefined){
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for message edit, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async messageDeleteBulk(Hyperion: IHyperion, messages: Array<Message|any>): Promise<void | undefined>{
        const msg = messages[0];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const guild = msg.channel.guild;
        if(!await this.preCheck(Hyperion, guild, "bulkDelete", msg?.member?.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "bulkDelete");
        if(!channelObj){return;}

        const data = {
            embed: {
                color: Hyperion.colors.red,
                timestamp: new Date,
                title: "Bulk Delete Log",
                description: `Bulk Delete in ${msg.channel.mention}, ${messages.length} messages deleted`
            }
        };

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for message delete, ${err}`, "Logging");
        }
    }

    //VOICE
    async voiceChannelJoin(Hyperion: IHyperion, member: Member, channel: VoiceChannel): Promise<void | undefined>{
        const guild = member.guild;
        if(!await this.preCheck(Hyperion, guild, "voiceJoin", member.roles, channel.id)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "voiceJoin");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.green,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for voice join, ${err}`, "Logging");
        }
    }

    async voiceChannelLeave(Hyperion: IHyperion, member: Member, channel: VoiceChannel): Promise<void | undefined>{
        const guild = member.guild;
        if(!await this.preCheck(Hyperion, guild, "voiceLeave", member.roles, channel.id)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "voiceLeave");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.orange,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for voice leave, ${err}`, "Logging");
        }
    }

    async voiceChannelSwitch(Hyperion: IHyperion, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel): Promise<void | undefined>{
        const guild = member.guild;
        if(!await this.preCheck(Hyperion, guild, "voiceJoin", member.roles, [oldChannel.id, newChannel.id])){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "voiceJoin");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.blue,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for voice switch, ${err}`, "Logging");
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
    async roleCreate(Hyperion: IHyperion, guild: Guild, role: Role): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "roleAdd")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "roleAdd");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.green,
                timestamp: new Date,
                title: "Role Created",
                description: `**Name:** ${role.name}\n**Position:** ${role.position}\n**Hoisted:** ${role.hoist ? "Yes" : "No"}\n**Mentionable:** ${role.mentionable ? "Yes" : "No"}\n**Managed:** ${role.managed ? "Yes" : "No"}\n**Color:** #${role.color.toString(16)}`,
                fields: [{name: "Permissions", value: this.permsToName(role.permissions.allow).join(", "), inline: false}],
                footer: {text: `Role ID: ${role.id}`}
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    async roleDelete(Hyperion: IHyperion, guild: Guild, role: Role): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "roleDelete")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "roleDelete");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.red,
                timestamp: new Date,
                title: "Role Deleted",
                description: `**Name:** ${role.name}\n**Position:** ${role.position}\n**Hoisted:** ${role.hoist ? "Yes" : "No"}\n**Mentionable:** ${role.mentionable ? "Yes" : "No"}\n**Managed:** ${role.managed ? "Yes" : "No"}\n**Color:** #${role.color.toString(16)}`,
                fields: [{name: "Permissions", value: this.permsToName(role.permissions.allow).join(", "), inline: false}],
                footer: {text: `Role ID: ${role.id}`}
            }
        };
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async roleUpdate(Hyperion: IHyperion, guild: Guild, role: Role, oldRole: any): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "roleUpdate")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "roleUpdate");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
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
        console.log("benis")
        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.blue,
                timestamp: new Date,
                title: "Role Updated",
                footer: {text: `Role ID: ${role.id}`},
                fields: [],
                description: ""
                
            }
        };
        if(oldRole.name && role.name !== oldRole.name){
            data.embed.description += `**Old Name:** ${oldRole.name}\n**New Name:** ${role.name}\n\n`;
        }

        if(oldRole.color && role.color !== oldRole.color){
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
            data.embed.thumbnail = {url: guild.iconURL};
        }
        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for role add, ${err}`, "Logging");
        }
    }

    //CHANNEL
    async channelCreate(Hyperion: IHyperion, guild: Guild, channel: GuildChannel): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "channelAdd")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "channelAdd");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.green,
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
            data.embed.thumbnail = {url: guild.iconURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for channel add, ${err}`, "Logging");
        }
    }

    async channelDelete(Hyperion: IHyperion, guild: Guild, channel: GuildChannel): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "channelDelete")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "channelDelete");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.red,
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
            data.embed.thumbnail = {url: guild.iconURL};
        }


        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for channel delete, ${err}`, "Logging");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async channelUpdate(Hyperion: IHyperion, guild: Guild, channel: GuildChannel, oldChannel: any): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "roleUpdate")){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "roleUpdate");
        if(!channelObj){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        let changes = false;
        let permUpdate = false;
        for(const key in Object.keys(oldChannel)){
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
                color: Hyperion.colors.blue,
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
                if((channel as VoiceChannel).userLimit !== oldChannel?.userLimit){
                    data.embed.description += `**Old User Limit:** ${oldChannel.userLimit ?? "Unlimited"} users\n**New User Limit:** ${(channel as VoiceChannel).userLimit ?? "Unlimited"} users\n\n`;
                }
            }
        }else{
            data.embed.description += `**Old Channel Type:** ${cNameType[oldChannel.type] ?? "Unknown"}\n**New Channel Type:** ${cNameType[channel.type] ?? "Unknown"}`;
        }
        if(config.showAvatar){
            data.embed.thumbnail = {url: guild.iconURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for channel update, ${err}`, "Logging");
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
    async messageReactionAdd(Hyperion: IHyperion, msg: Message, emote: Emoji, userID: string): Promise<void | undefined>{
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.getLoggingConfig(this.Hyperion, guild.id);
        if(!config.ghostReact.enabled){return;}
        this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:name`, emote.name, "EX", config.ghostReactTime);
        this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:time`, Date.now(), "EX", config.ghostReactTime);
        if(emote.animated){
            this.Hyperion.redis.set(`Ghost:${guild.id}:${msg.id}:${userID}:${emote.id}:animated`, 1, "EX", config.ghostReactTime);
        }
    }

    async messageReactionRemove(Hyperion: IHyperion, msg: Message, emote: Emoji, userID: string): Promise<void | undefined>{
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.getLoggingConfig(this.Hyperion, guild.id);
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
        if(!await this.preCheck(this.Hyperion, guild, "ghostReact", member.roles, msg.channel.id)){return;}
        const channelObj = await this.testChannel(this.Hyperion, guild, "ghostReact");
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
    async guildMemberRolesUpdate(Hyperion: IHyperion, guild: Guild, member: Member, oldMember: any): Promise<void | undefined>{
        const addedRoles: Array<string> = [];
        const removedRoles: Array<string> = [];
        member.roles.forEach(r => {
            if(!oldMember.roles.includes(r)){addedRoles.push(r);}
        });
        oldMember.roles.forEach((r: string) => {
            if(!member.roles.includes(r)){removedRoles.push(r);}
        });
        if(addedRoles.length !== 0 && removedRoles.length !== 0){return this.memberRoleUpdate(Hyperion, guild, member, addedRoles, removedRoles);}
        if(addedRoles.length !== 0 && removedRoles.length === 0){return this.memberRoleAdd(Hyperion, guild, member, addedRoles);}
        if(addedRoles.length === 0 && removedRoles.length !== 0){return this.memberRoleRemove(Hyperion, guild, member, removedRoles);}
    }
    
    async memberRoleAdd(Hyperion: IHyperion, guild: Guild, member: Member, roles: Array<string>): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberRoleAdd", roles, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberRoleAdd");
        if(!channelObj){return;}
        const sorted = Hyperion.utils.sortRoles(roles, guild.roles).map(r => r.id);
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Add",
                color: Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Added**\n${sorted.map(r => `<@&${r}>`).join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for member role add, ${err}`, "Logging");
        }
    }

    async memberRoleRemove(Hyperion: IHyperion, guild: Guild, member: Member, roles: Array<string>): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberRoleRemove", roles, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberRoleRemove");
        if(!channelObj){return;}
        const sorted = Hyperion.utils.sortRoles(roles, guild.roles).map(r => r.id);
        if(sorted.length !== roles.length){
            for(const role of roles){
                if(!sorted.includes(role)){sorted.push(role);}
            }
        }
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Remove",
                color: Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Removed**\n${sorted.map(r => `<@&${r}>`).join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for member role remove, ${err}`, "Logging");
        }
    }

    async memberRoleUpdate(Hyperion: IHyperion, guild: Guild, member: Member, rolesAdded: Array<string>, rolesRemoved: Array<string>): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberRoleUpdate", rolesAdded, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberRoleUpdate");
        if(!channelObj){return;}
        const sortedAdd = Hyperion.utils.sortRoles(rolesAdded, guild.roles).map(r => r.id);
        const sortedRemove = Hyperion.utils.sortRoles(rolesRemoved, guild.roles).map(r => r.id);

        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Role Update",
                color: Hyperion.colors.blue,
                footer: {
                    text: `ID: ${member.id}`
                },
                timestamp: new Date,
                description: `**User:** ${member.mention} - ${member.username}#${member.discriminator}\n(${member.id})\n**Roles Added**\n${sortedAdd.map(r => `<@&${r}>`).join("\n")}\n**Roles Removed**\n${sortedRemove.map(r => `<@&${r}>`).join("\n")}`
            }
        };

        if(config.showAvatar){
            data.embed.thumbnail = {url: member.avatarURL};
        }

        try{
            await channelObj.createMessage(data);
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to post log for member role remove, ${err}`, "Logging");
        }
    }

    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberNickUpdate(Hyperion: IHyperion, guild: Guild, member: Member, oldMember: any): Promise<void | undefined>{
        if(!await this.preCheck(Hyperion, guild, "memberNicknameChange", undefined, undefined)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "memberNicknameChange");
        if(!channelObj){return;}

        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const field: Array<{name: string; value: string; inline: boolean}> = [];
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Nickname update",
                color: Hyperion.colors.default,
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
            Hyperion.logger.warn("Hyperion", `Failed to post log for member nickname change, ${err}`, "Logging");
        }
    }
}

export default Logging;
