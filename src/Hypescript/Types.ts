import { GuildTextableChannel, Message } from "eris";


export interface HypescriptContext{
    content: string;
    mentions: Array<string> | null;
    channelMentions: Array<string> | null;
    roleMentions: Array<string> | null;
    channel: GuildTextableChannel;
    msg: Message;
}