/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {Module} from "../../Core/Structures/Module";
// eslint-disable-next-line no-unused-vars
import {IHyperion, GuildConfig, LogEvent} from "../../types";
// eslint-disable-next-line no-unused-vars
import { Guild, Member, User, Message, VoiceChannel, Role, GuildChannel, Emoji, TextChannel, Embed } from "eris";
import {LoggingConfig} from "../../Core/DataManagers/MongoGuildManager";
import {default as msc} from "pretty-ms";
import { IGuild } from "../../MongoDB/Guild";
class Logging extends Module{
    constructor(){
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
                "guildMemberUpdate"
            ]
        });
    }

    escapeCodeblock(input: string){
        const rx = new RegExp("```", "gmi");
        // eslint-disable-next-line no-useless-escape
        return input.replace(rx, "\\`\\`\\`");
    }

    async getEventConfig(Hyperion: IHyperion, guildID: string, eventName: string): Promise<LogEvent>{
        const config: IGuild | null = await Hyperion.managers.guild.getConfig(guildID);
        if(!config?.logging){return new LoggingConfig({})[eventName];}
        if(!(config.logging as LoggingConfig)[eventName]){return {enabled: false, channel: "default", ignoredRoles: [], ignoredChannels: []};}
        return (config.logging as LoggingConfig)[eventName];
    }

    async getLoggingConfig(Hyperion: IHyperion, guildID: string): Promise<LoggingConfig>{
        const config: IGuild | null = await Hyperion.managers.guild.getConfig(guildID);
        if(!config?.logging){return new LoggingConfig({});}
        return (config.logging as LoggingConfig);
    }

    async preCheck(Hyperion: IHyperion, guild: Guild, eventName: string, roles?: Array<string>, channel?: string): Promise<boolean>{
        if(!await this.checkGuildEnabled(Hyperion, guild.id)){return false;}
        const econfig = await this.getEventConfig(Hyperion, guild.id, eventName);
        if(!econfig){return false;}
        if(econfig.enabled === false){return false;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);
        if(roles){
            if(config?.ignoredRoles?.some((r: string) => roles.indexOf(r) >= 0)){return false;}
            if(econfig?.ignoredRoles?.some((r: string) => roles.indexOf(r) >= 0)){return false;}
        }
        if(channel){
            if(config?.ignoredChannels?.includes(channel)){return false;}
            if(econfig?.ignoredChannels?.includes(channel)){return false;}
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
                color: Hyperion.defaultColor,
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
        if(await Hyperion.redis.get(`${guild.id}:${member.id}:banAdd`) !== null){return;}
        const config: LoggingConfig = await this.getLoggingConfig(Hyperion, guild.id);

        const data: {embed: Partial<Embed>} = {
            embed: {
                title: "Member Leave",
                color: Hyperion.defaultColor,
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
                color: Hyperion.defaultColor,
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
                color: Hyperion.defaultColor,
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
        if(!await this.preCheck(Hyperion, guild, "messageDelete", msg.channel.id, msg?.member?.roles)){return;}
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
                color: Hyperion.defaultColor,
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
        if(!await this.preCheck(Hyperion, guild, "messageEdit", msg.channel.id, msg?.member?.roles)){return;}
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
                color: Hyperion.defaultColor,
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

        if(msg.content.length > 1000){
            data.embed.fields.push({
                name: "New Message Content",
                value: `\`\`\`\n${this.escapeCodeblock(msg.content.substring(0, 1001))}...\n\`\`\``,
                inline: false
            });
        }else{
            data.embed.fields.push({
                name: "New Message Content",
                value: `\`\`\`\n${this.escapeCodeblock(msg.content)}\n\`\`\``,
                inline: false
            });
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
        if(!await this.preCheck(Hyperion, guild, "bulkDelete", msg.channel.id, msg?.member?.roles)){return;}
        const channelObj = await this.testChannel(Hyperion, guild, "bulkDelete");
        if(!channelObj){return;}

        const data = {
            embed: {
                color: Hyperion.defaultColor,
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
    async voiceJoin(Hyperion: IHyperion, member: Member, channel: VoiceChannel){

    }

    async voiceLeave(Hyperion: IHyperion, member: Member, channel: VoiceChannel){
        
    }

    async voiceSwitch(Hyperion: IHyperion, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel){
        
    }



    //ROLE
    async roleCreate(Hyperion: IHyperion, guild: Guild, role: Role){

    }

    async roleDelete(Hyperion: IHyperion, guild: Guild, role: Role){
        
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async roleUpdate(Hyperion: IHyperion, guild: Guild, role: Role, oldRole: any){
        
    }



    //CHANNEL
    async channelCreate(Hyperion: IHyperion, guild: Guild, channel: GuildChannel){

    }

    async channelDelete(Hyperion: IHyperion, guild: Guild, channel: GuildChannel){
        
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async channelUpdate(Hyperion: IHyperion, guild: Guild, channel: GuildChannel, oldChannel: any){
        
    }



    //MISC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async webhooksUpdate(Hyperion: IHyperion, data: any, channelID: string, guildID: string){

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildUpdate(Hyperion: IHyperion, guild: Guild, oldGuild: any){

    }




    //REACTIONS
    async messageReactionAdd(Hyperion: IHyperion, msg: Message, emote: Emoji, userID: string){

    }

    async messageReactionRemove(Hyperion: IHyperion, msg: Message, emote: Emoji, userID: string){
        
    }

    async messageReactionRemoveAll(Hyperion: IHyperion, msg: Message){
        
    }



    //CUSTOM
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async system(Hyperion: IHyperion, message: any){

    }

    async ghostReact(Hyperion: IHyperion, member: Member, msg: Message, emote: Emoji){

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async guildMemberRolesUpdate(Hyperion: IHyperion, guild: Guild, member: Member, oldMember: any){

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
                color: Hyperion.defaultColor,
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