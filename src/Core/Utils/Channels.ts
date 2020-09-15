import { Guild, GuildChannel, Message, VoiceChannel, CategoryChannel, GuildTextableChannel } from "eris";



export function resolveTextChannel(guild: Guild, msg: Message,  search: string): GuildTextableChannel | undefined{
    let channel = guild.channels.get(search);
    if(!channel && msg?.channelMentions && msg.channelMentions[0]){
        channel = guild.channels.get(msg.channelMentions[0]);
    }
    if(!channel){
        channel = guild.channels.find((C: GuildChannel) => C.name.toLowerCase().startsWith(search.toLowerCase()));
    }
    if(channel && !(channel.type === 0 || channel.type === 5)){return;}
    return channel;
}

export function resolveVoiceChannel(guild: Guild, msg: Message,  search: string): VoiceChannel | undefined{
    let channel = guild.channels.get(search);
    if(!channel){
        channel = guild.channels.find((C: GuildChannel) => C.type === 2 && C.name.toLowerCase().startsWith(search.toLowerCase()));
    }
    if(channel && channel.type !== 2){return;}
    return channel;
}

export function resolveCategory(guild: Guild, msg: Message,  search: string): CategoryChannel | undefined{
    let channel = guild.channels.get(search);
    if(!channel && msg?.channelMentions && msg.channelMentions[0]){
        channel = guild.channels.get(msg.channelMentions[0]);
    }
    if(!channel){
        channel = guild.channels.find((C: GuildChannel) => C.name.toLowerCase().startsWith(search.toLowerCase()));
    }
    if(channel && channel.type !== 4){return;}
    return channel;
}

export function resolveGuildChannel(guild: Guild, msg: Message, search: string): GuildChannel | undefined{
    let channel = guild.channels.get(search);
    if(!channel && msg?.channelMentions && msg.channelMentions[0]){
        channel = guild.channels.get(msg.channelMentions[0]);
    }
    if(!channel){
        channel = guild.channels.find((C: GuildChannel) => C.name.toLowerCase().startsWith(search.toLowerCase()));
    }
    return channel;
}