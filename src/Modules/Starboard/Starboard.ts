import Module from "../../Structures/Module";
import hyperion, { CGuild, StarType } from "../../main";
import { AdvancedMessageContent, Emoji, GuildTextableChannel, Member, Message, MessageFile, PossiblyUncachedMessage, Embed } from "eris";
import {default as fetch} from "node-fetch";

interface sbConfig {
    emote: string;
    starChannel: string;
    thresholds: {[key: string]: number};
    defaultThreshold: number;
    splitChannels: {[key: string]: string};
    removeSelfStars: boolean;
    removeOnUnreact: boolean;
    color: {preferRole: boolean; value: number | "random"};
    ignoredChannels: Array<string>;
    ignoredPosterRoles: Array<string>;
    ignoredStarRoles: Array<string>;
    addStarToBoard: boolean;

    //legacy migrations
    ignoredRoles?: Array<string>;
    starCount?: number;
    
}

const config = (data: Partial<sbConfig>): sbConfig => {
    data.emote ??= "⭐";
    data.starChannel ??= "";
    data.thresholds ??= {};
    data.defaultThreshold ??= 3;
    data.splitChannels ??= {};
    data.removeSelfStars ??= true;
    data.removeOnUnreact ??= false;
    data.addStarToBoard ??= true;
    if(data.color){
        data.color.preferRole ??= false;
        data.color.value ??= 6658041;
    }else{
        data.color = {preferRole: false, value: 6658041};
    }
    data.ignoredChannels ??= [];
    data.ignoredPosterRoles ??= [];
    data.ignoredStarRoles ??= [];

    //migrations
    if(data.starCount){
        data.defaultThreshold = data.starCount;
        delete data.starCount;
    }
    if(data.ignoredRoles){
        data.ignoredPosterRoles = data.ignoredStarRoles = data.ignoredRoles;
        delete data.ignoredRoles;
    }
    return data as sbConfig;
};

const save = (data: Partial<sbConfig>): sbConfig => {
    const template = config({});
    for (const key of Object.keys(data) as Array<keyof sbConfig>){
        if(data[key] === template[key]){delete data[key];}
    }

    //migrations
    if(data.starCount){
        data.defaultThreshold = data.starCount;
        delete data.starCount;
    }
    if(data.ignoredRoles){
        data.ignoredPosterRoles = data.ignoredStarRoles = data.ignoredRoles;
        delete data.ignoredRoles;
    }
    return data as sbConfig;
};

export default class Starboard extends Module<sbConfig> {
    constructor(Hyperion: hyperion){
        super({
            name: "starboard",
            dir: __dirname,
            path: __dirname + "/Starboard.js",
            hasCommands: true,
            alwaysEnabled: false,
            subscribedEvents: ["messageDelete", "messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll"],
            config,
            save
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    async onUnload(){
        return true;
    }

    async getEmote(guild: CGuild): Promise<string> {
        if(!guild.cfg){
            guild.cfg = await this.Hyperion.manager.guild().get(guild.id);
        }
        guild.lastUsed = Date.now();
        return guild.cfg.starboard.emote ?? "⭐";
    }

    async getDisplayEmote(guild: CGuild): Promise<string> {
        if(!guild.cfg){
            guild.cfg = await this.Hyperion.manager.guild().get(guild.id);
        }
        guild.lastUsed = Date.now();
        if(guild.cfg.starboard.emote.includes(":")){
            return `<${guild.cfg.starboard.emote}>`;
        }else{
            return guild.cfg.starboard.emote;
        }
    }

    parseEmote(emote: Emoji): string {
        return emote.id ? emote.animated ? `a:${emote.name}:${emote.id}` : `${emote.name}:${emote.id}` : emote.name;
    }

    getColor(config: sbConfig, member: Member): number {
        if(config.color.preferRole){
            const color = this.Hyperion.utils.getColor(this.Hyperion.utils.getRoles(member), member.guild.roles);
            if(color !== 0){return color;}
        }
        if(config.color.value === "random"){
            return this.Hyperion.utils.randomColor();
        }
        return config.color.value as number;
    }

    async getAttachments(msg: Message): Promise<MessageFile | undefined> {
        if(!msg.attachments || msg.attachments.length === 0){return;}
        const att = msg.attachments[0];
        const data = await this.resolveFileAsBuffer(att.url);
        if(data){
            return {file: data, name: att.filename};
        }
    }

    async formatOriginalPost(sourceMessage: Message<GuildTextableChannel>, count: number): Promise<{data: AdvancedMessageContent; file?: MessageFile}> {
        const guild = (sourceMessage as Message<GuildTextableChannel>).channel.guild as CGuild;
        if(!guild.cfg){
            guild.cfg = await this.Hyperion.manager.guild().get(guild.id);
        }
        guild.lastUsed = Date.now();
        const embed: Partial<Embed> = {
            author: {
                name: sourceMessage.author.friendlyName,
                icon_url: sourceMessage.author.avatarURL
            },
            color: this.getColor(guild.cfg.starboard, sourceMessage.member)
        };
        if(sourceMessage.content){
            embed.description = sourceMessage.content;
        }
        if(sourceMessage.embeds[0]){
            const emb = sourceMessage.embeds[0];
            if([".png", ".jpg", ".jpeg", ".gif"].some(end => emb.url?.endsWith(end))){
                embed.image = {url: emb.url};
            }else{
                if(emb.image && emb.image.url){
                    embed.image = emb.image;
                }else {
                    if(emb.thumbnail && emb.thumbnail.url){
                        embed.image = emb.thumbnail;
                    }
                }
            }
        }
        embed.fields = [{name: "\u200b", value: `${sourceMessage.channel.mention} - [Original Message](${sourceMessage.jumpLink})`}];
        const attachments = await this.getAttachments(sourceMessage);
        const content =`${await this.getDisplayEmote(guild)} ${count}`;
        return attachments ? {data: {content, embed}, file: attachments} : {data: {content, embed}};
    }

    async createPost(channel: GuildTextableChannel, msg: Message<GuildTextableChannel>, count: number): Promise<void> {
        const toPost = await this.formatOriginalPost(msg, count);
        if(toPost.file){
            await channel.createMessage(toPost.data, toPost.file).then(async (post) => {
                await this.addStarPostData(msg.id, channel.guild.id, post.id, post.channel.id);
            });
        }

    }

    async updatePost(data: StarType): Promise<void> {
        const channel = this.Hyperion.client.guilds.get(data.guild)!.channels.get(data.starChannel!) as GuildTextableChannel;
        if(!channel){return;}
        const msg = channel.messages.get(data.starPost!) ?? await channel.getMessage(data.starPost!).catch(() => undefined);
        if(!msg){return;}
        const content = msg.content.split(" ")[0] + ` ${data.count}`;
        msg.edit({content, embed: msg.embeds[0]}).catch();
    }

    async inc(guild: string, msg: string): Promise<number> {
        const data = await this.Hyperion.manager.stars().getByMessage(guild, msg);
        if(!data){return 0;}
        data.count++;
        await this.Hyperion.manager.stars().update(guild, msg, data);
        return data.count;
    }

    async dec(guild: string, msg: string): Promise<number> {
        const data = await this.Hyperion.manager.stars().getByMessage(guild, msg);
        if(!data){return 0;}
        data.count--;
        await this.Hyperion.manager.stars().update(guild, msg, data);
        return data.count;
    }

    async findData(guild: string, id: string): Promise<null | {starPost: boolean; data: StarType}> {
        const data = await this.Hyperion.manager.stars().raw().findOne({guild}).or([{message: id}, {starPost: id}]).lean<StarType>().exec();
        if(!data){return null;}
        if(data.message === id){
            return {starPost: false, data};
        }else{
            return {starPost: true, data};
        }
    }

    async createData(message: string, channel: string, guild: string, user: string, count?: number): Promise<StarType> {
        if(count !== undefined){
            return await this.Hyperion.manager.stars().create({guild, channel, message, user, count});
        }
        return await this.Hyperion.manager.stars().create({guild, channel, message, user});
    }

    async addStarPostData(message: string, guild: string, starPost: string, starChannel: string): Promise<StarType> {
        return await this.Hyperion.manager.stars().update(guild, message, {starPost, starChannel});
    }

    ignoredPoster(config: sbConfig, member: Member): boolean {
        if(config.ignoredPosterRoles.some(r => member.roles.includes(r))){return false;}
        return true;
    }

    ignoredStarrer(config: sbConfig, member: Member): boolean {
        if(config.ignoredStarRoles.some(r => member.roles.includes(r))){return false;}
        return true;
    }

    async postInitial(smsg: Message<GuildTextableChannel>, guild: CGuild, data: StarType): Promise<void> {
        const payload = await this.formatOriginalPost(smsg, data.count);
        let channel: GuildTextableChannel | undefined;
        if(guild.cfg!.starboard.splitChannels[smsg.channel.id]){
            channel = guild.channels.get(guild.cfg!.starboard.splitChannels[smsg.channel.id]) as undefined | GuildTextableChannel;
        } else {
            channel = guild.channels.get(guild.cfg!.starboard.starChannel) as undefined | GuildTextableChannel;
        }
        if(!channel){return;}
        await (channel.createMessage(payload.data, payload.file)).then(async post => {
            data.starPost = post.id;
            data.starChannel = channel!.id;
            await this.Hyperion.manager.stars().update(data.guild, data.message, data);
            if(guild.cfg!.starboard.addStarToBoard){
                post.addReaction(guild.cfg!.starboard.emote).catch(() => undefined);
            }
        }).catch(() => undefined);
    }

    async handleOrig(guild: CGuild, user: Member, data: StarType, add: boolean): Promise<void> {
        if(data.starPost){return;}
        data.origStars ??= [];
        if(add){
            data.origStars.push(user.id);
        }else{
            const idx = data.origStars.indexOf(user.id);
            if(idx < 0){return;}
            data.origStars = data.origStars.slice(0, idx).concat(data.origStars.slice(idx+1));
        }
        await this.Hyperion.manager.stars().update(guild.id, data.message, data);
    }

    getChannelThreshold(channel: string, config: sbConfig): number {
        return config.thresholds[channel] ?? config.defaultThreshold;
    }

    getStarboardChannel(channel: string, config: sbConfig): string | undefined {
        return config.splitChannels[channel] ?? config.starChannel !== "" ? config.starChannel : undefined;
    }

    // eslint-disable-next-line complexity
    async messageReactionAdd(...args: [PossiblyUncachedMessage, Emoji, Member | {id: string}]): Promise<void> {
        let omsg: PossiblyUncachedMessage | Message | undefined = args[0];
        const guild = await this.Hyperion.getCGuild(this.Hyperion.client.guilds.get(omsg.guildID ?? this.Hyperion.client.channelGuildMap[omsg.channel.id])!);
        if(!this.guildEnabled(guild.cfg!)){return;}
        const channel = guild.channels.get(omsg.channel.id)!;
        if(guild.cfg!.starboard.ignoredChannels.includes(channel.id)){return;}
        if(!(channel.type === 0 || channel.type === 5)){return;}
        if(!(omsg as Message).author){
            omsg = await channel.getMessage(omsg.id).catch(() => undefined);
            if(!omsg){return;}
        }
        const msg = omsg as Message<GuildTextableChannel>;
        if(msg.member && !this.ignoredPoster(guild.cfg!.starboard, msg.member)){return;}
        const emote = args[1];
        const user = args[2] instanceof Member ? args[2] : await this.Hyperion.utils.gofMember(guild, args[2].id);
        if(!user){return;}
        if(user.bot){return;}
        if(!this.ignoredStarrer(guild.cfg!.starboard, user)){return;}
        if(this.parseEmote(emote) !== guild.cfg!.starboard.emote){return;}
        if(msg.author.id === user.id){
            if(guild.cfg!.starboard.removeSelfStars){
                msg.removeReaction(guild.cfg!.starboard.emote, user.id).catch(() => undefined);
            }
            return;
        }
        let data = await this.findData(guild.id, msg.id);
        let fresh = false;
        if(!data){
            data = {starPost: false, data: await this.createData(msg.id, channel.id, guild.id, msg.author.id)};
            fresh = true;
        }
        if(!data.starPost){
            if(data.data.count === undefined){data.data.count = 1;}
            await this.handleOrig(guild, user, data.data, true);
        }
        if(!fresh){data.data.count = await this.inc(guild.id, data.data.message);}
        if(!data.data.starPost && data.data.count >= this.getChannelThreshold(channel.id, guild.cfg!.starboard)){
            await this.postInitial(msg, guild, data.data);
            return;
        }
        if(data.data.starPost && (data.data.count >= this.getChannelThreshold(channel.id, guild.cfg!.starboard) || (data.data.locked || !guild.cfg!.starboard.removeOnUnreact))){
            await this.updatePost(data.data);
            return;
        }
        
    }

    // eslint-disable-next-line complexity
    async messageReactionRemove(...args: [PossiblyUncachedMessage, Emoji, string]): Promise<void> {
        let omsg: PossiblyUncachedMessage | Message | undefined = args[0];
        const guild = await this.Hyperion.getCGuild(this.Hyperion.client.guilds.get(omsg.guildID ?? this.Hyperion.client.channelGuildMap[omsg.channel.id])!);
        if(!this.guildEnabled(guild.cfg!)){return;}
        const channel = guild.channels.get(omsg.channel.id)!;
        if(guild.cfg!.starboard.ignoredChannels.includes(channel.id)){return;}
        if(!(channel.type === 0 || channel.type === 5)){return;}
        if(!(omsg as Message).author){
            omsg = await channel.getMessage(omsg.id).catch(() => undefined);
            if(!omsg){return;}
        }
        const msg = omsg as Message<GuildTextableChannel>;
        if(msg.member && !this.ignoredPoster(guild.cfg!.starboard, msg.member)){return;}
        const emote = args[1];
        const user = await this.Hyperion.utils.gofMember(guild, args[2]);
        if(!user){return;}
        if(user.bot){return;}
        if(!this.ignoredStarrer(guild.cfg!.starboard, user)){return;}
        if(this.parseEmote(emote) !== guild.cfg!.starboard.emote){return;}
        if(msg.author.id === user.id){return;}
        let data = await this.findData(guild.id, msg.id);
        let fresh = false;
        if(!data){
            data = {starPost: false, data: await this.createData(msg.id, channel.id, guild.id, msg.author.id, 0)};
            fresh = true;
        }
        if(!data.starPost){
            if(data.data.count === undefined){data.data.count = 0;}
            await this.handleOrig(guild, user, data.data, false);
        }
        if(!fresh){data.data.count = await this.dec(guild.id, data.data.message);}
        if(data.data.starPost && (data.data.count >= this.getChannelThreshold(channel.id, guild.cfg!.starboard) || (data.data.locked || !guild.cfg!.starboard.removeOnUnreact))){
            await this.updatePost(data.data);
            return;
        }
        if(data.data.starPost && data.data.count < this.getChannelThreshold(channel.id, guild.cfg!.starboard) && !data.data.locked && guild.cfg!.starboard.removeOnUnreact){
            const sbChan = guild.channels.get(data.data.starChannel!) as GuildTextableChannel | undefined;
            if(sbChan){
                const sbMsg = sbChan.messages.get(data.data.starPost!) ?? await sbChan.getMessage(data.data.starPost!).catch(() => undefined);
                if(sbMsg){sbMsg.delete().catch(() => undefined);}
            }
            delete data.data.starPost;
            delete data.data.starChannel;
            await this.Hyperion.manager.stars().update(guild.id, data.data.message, data.data);
            return;
        }
    }

    async messageDelete(...args: [PossiblyUncachedMessage]): Promise<void> {
        const guild = await this.Hyperion.getCGuild(this.Hyperion.client.guilds.get((args[0].channel as GuildTextableChannel).guild.id)!);
        if(!this.guildEnabled(guild.cfg!)){return;}
        const normalData = await this.Hyperion.manager.stars().getByMessage(guild.id, args[0].id);
        if(normalData){
            await this.Hyperion.manager.stars().delete(guild.id, args[0].id);
            if(normalData.starPost && !normalData.locked){
                const channel = guild.channels.get(normalData.starChannel!) as undefined | GuildTextableChannel;
                if(channel){
                    const smsg = channel.messages.get(normalData.starPost) ?? await channel.getMessage(normalData.starPost).catch(() => undefined);
                    if(smsg){smsg.delete().catch(() => undefined);}
                }
            }
            return;
        }
        const starpostData = await this.Hyperion.manager.stars().getByMessage(guild.id, args[0].id);
        if(starpostData){
            await this.Hyperion.manager.stars().update(guild.id, starpostData.message, {deleted: true});
            return;
        }
    }

    async resolveFileAsBuffer(resource: string): Promise<Buffer | undefined> {
        const file = await this.resolveFile(resource);
        if(!file){return;}
        if (Buffer.isBuffer(file)) return file;
    
        const buffers = [];
        for await (const data of file) buffers.push(data);
        return Buffer.concat((buffers as Uint8Array[]));
    }

    async resolveFile(resource: string): Promise<NodeJS.ReadableStream | undefined> {
        if (/^https?:\/\//.test(resource)) {
            const res = await fetch(resource);
            return res.body;
        }else{
            return;
        }
    }
}