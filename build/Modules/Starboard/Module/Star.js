"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Starred_1 = __importDefault(require("../../../MongoDB/Starred"));
async function star(Hyperion, omsg, emote, userID, conf, op) {
    let msg;
    if (!omsg.author) {
        msg = await omsg.channel.getMessage(omsg.id);
    }
    else {
        msg = omsg;
    }
    if (op === "del") {
        if (!emote || !emote.name || emote.name !== "⭐") {
            return;
        }
        if (Hyperion.stars[msg.id] === undefined) {
            return;
        }
        Hyperion.stars[msg.id].count--;
        return;
    }
    if (!emote || !emote.name || emote.name !== "⭐") {
        return;
    }
    if (!conf.starboard.selfStar && msg.author.id === userID) {
        return;
    }
    if (conf.starboard.ignoredChannels.includes(msg.channel.id)) {
        return;
    }
    if (Hyperion.stars[msg.id] !== undefined) {
        Hyperion.stars[msg.id].count++;
    }
    else {
        const fetched = await msg.channel.getMessage(msg.id);
        Hyperion.stars[msg.id] = {
            count: fetched.reactions["⭐"].count,
            msg: null
        };
    }
    if (Hyperion.stars[msg.id].count > conf.starboard.starCount) {
        if (Hyperion.stars[msg.id].msg !== null) {
            updatePost(Hyperion, Hyperion.stars[msg.id].msg, Hyperion.stars[msg.id].count);
        }
        else {
            if (await Starred_1.default.exists({ message: msg.id })) {
                const oldPostID = await Starred_1.default.findOne({ message: msg.id }).lean.exec();
                const oldPost = await msg.channel.getMessage(oldPostID.starpost);
                updatePost(Hyperion, oldPost, Hyperion.stars[msg.id].count);
            }
            else {
                const post = await createPost(Hyperion, msg, conf, Hyperion.stars[msg.id].count);
                if (!post) {
                    return;
                }
                Starred_1.default.create({ guild: msg.channel.guild.id, message: msg.id, starpost: post.id });
            }
        }
    }
}
async function createPost(Hyperion, starred, conf, count) {
    if (starred.channel.type !== 0) {
        return;
    }
    const msglink = `https://discordapp.com/channels/${starred.channel.guild.id}/${starred.channel.id}/${starred.id}`;
    let Starpost = {
        content: `${count}⭐`,
        embed: {
            color: Hyperion.defaultColor,
            timestamp: new Date,
            description: `**[Original Message](${msglink})**\n${starred.channel.mention}\n${starred.cleanContent}`,
            author: {
                icon_url: starred.author.avatarURL,
                name: `${starred.author.username}#${starred.author.discriminator}`
            }
        }
    };
    if (starred.attachments && starred.attachments[0]) {
        if (starred.attachments[0].url.endsWith(".png") || starred.attachments[0].url.endsWith(".gif") || starred.attachments[0].url.endsWith(".jpg")) {
            if (!Starpost.embed) {
                return;
            }
            Starpost.embed.image = { url: starred.attachments[0].url };
        }
    }
    return await Hyperion.client.createMessage(conf.starboard.starChannel, Starpost);
}
async function updatePost(Hyperion, sentMessage, newCount) {
    sentMessage.edit({ content: `${newCount}⭐`, embed: sentMessage.embeds[0] });
}
exports.default = star;
