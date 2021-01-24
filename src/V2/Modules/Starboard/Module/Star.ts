/* eslint-disable no-unused-vars */
import {IHyperion, GuildConfig} from "../../../types";
import {Message, MessageContent, Emoji} from "eris";


async function updatePost(Hyperion: IHyperion, sentMessage: Message, newCount: number): Promise<void>{
    sentMessage.edit({content: `${newCount}⭐`, embed: sentMessage.embeds[0]});
}



async function createPost(Hyperion: IHyperion, starred: Message, conf: GuildConfig, count: number): Promise<Message | undefined>{

    if(starred.channel.type !== 0){return;}
    const msglink = `https://discordapp.com/channels/${starred.channel.guild.id}/${starred.channel.id}/${starred.id}`;
    const Starpost: MessageContent = {
        content: `${count}⭐`,
        embed: {
            color: Hyperion.colors.default,
            timestamp: new Date,
            description: `**[Original Message](${msglink})**\n${starred.channel.mention}\n${starred.cleanContent}`,
            author: {
                icon_url: starred.author.avatarURL,
                name: `${starred.author.username}#${starred.author.discriminator}`
            }
        }
    };
    if(starred.attachments && starred.attachments[0]){
        if(starred.attachments[0].url.endsWith(".png") || starred.attachments[0].url.endsWith(".gif") || starred.attachments[0].url.endsWith(".jpg")){
            if(!Starpost.embed){return;}
            Starpost.embed.image = {url: starred.attachments[0].url};
        }
    }
    return await Hyperion.client.createMessage(conf.starboard.starChannel, Starpost);

}


// eslint-disable-next-line complexity
async function star(Hyperion: IHyperion, omsg: Message, emote: Emoji, userID: string, conf: GuildConfig, op: string): Promise<void | undefined>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let msg: any;
    if(!omsg.author){
        msg = await omsg.channel.getMessage(omsg.id);
    }else{
        msg = omsg;
    }
    if(op === "del"){
        if(!emote || !emote.name || emote.name !== "⭐"){return;}
        if(Hyperion.stars[msg.id] === undefined){return;}
        Hyperion.stars[msg.id].count--;
        return;
    }
    if(!emote || !emote.name || emote.name !== "⭐"){return;}
    if(!conf.starboard.selfStar && msg.author.id === userID){return;}
    if(conf.starboard.ignoredChannels.includes(msg.channel.id)){return;}
    if(Hyperion.stars[msg.id] !== undefined){
        Hyperion.stars[msg.id].count++;
    }else{
        const fetched = await msg.channel.getMessage(msg.id);
        Hyperion.stars[msg.id] = {
            count: fetched.reactions["⭐"].count,
            msg: null
        };
    }

    if(Hyperion.stars[msg.id].count > conf.starboard.starCount){
        if(Hyperion.stars[msg.id].msg !== null){
            updatePost(Hyperion, Hyperion.stars[msg.id].msg, Hyperion.stars[msg.id].count);
        }else{
            if(await Hyperion.managers.stars.raw().exists({message: msg.id})){
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const oldPostID: any = await Hyperion.managers.stars.raw().findOne({message: msg.id}).lean().exec();
                if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
                const channel = msg.channel.guild.channels.get(conf.starboard.starChannel);
                const oldPost: Message = channel.messages.get(oldPostID.starpost) ?? await channel.getMessage(oldPostID.starpost);
                updatePost(Hyperion, oldPost, Hyperion.stars[msg.id].count);
            }else{
                const post: Message | undefined = await createPost(Hyperion, msg, conf, Hyperion.stars[msg.id].count);
                if(!post){return;}
                Hyperion.managers.stars.raw().create({guild: msg.channel.guild.id, message: msg.id, starpost: post.id});
            }
        }
    }
}




export default star;