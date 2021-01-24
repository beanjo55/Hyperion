import { Guild, GuildTextableChannel, Message} from "eris";
import {Module} from "../../Structures/Module";
import { EmbedResponse, IHyperion } from "../../types";
import {inspect} from "util";
import { GuilduserType } from "../../../main";

class Highlights extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "highlights",
            friendlyName: "Highlights",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            noToggle: true,
            dirname: __dirname,
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(...args: [Message]): Promise<void>{
        const msg = args[0];
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        const count = await this.Hyperion.redis.scard(`Highlights:${guild.id}`);
        if(count === 0){return;}
        await this.setUserCooldown(msg.author.id, guild.id);
        this.parseHighlights(msg.content, guild, msg.channel, msg);
    }

    async addGuildHighlight(guild: string, highlight: string): Promise<void>{
        const exists = await this.Hyperion.redis.sismember(`Highlights:${guild}`, highlight.toLowerCase());
        if(exists){
            throw new Error("Highlight already exists");
        }
        await this.Hyperion.redis.sadd(`Highlights:${guild}`, highlight.toLowerCase());
    }

    async removeGuildHighlight(guild: string, highlight: string, ): Promise<void>{
        const exists = await this.Hyperion.redis.sismember(`Highlights:${guild}`, highlight.toLowerCase());
        if(!exists){
            throw new Error("Highlight doesnt exist");
        }
        await this.Hyperion.redis.srem(`Highlights:${guild}`, highlight.toLowerCase());
    }

    async addHighlightCooldown(guild: string, word: string): Promise<void>{
        this.Hyperion.redis.set(`HighlightCooldown:${guild}:${word.toLowerCase()}`, 1, "EX", 60*5);
    }

    async checkHighlightCooldown(guild: string, word: string): Promise<boolean>{
        const result = await this.Hyperion.redis.get(`HighlightCooldown:${guild}:${word.toLowerCase()}`);
        if(result === null){return true;}
        return false;
    }

    async checkUserCooldown(user: string, guild: string): Promise<boolean>{
        const result = await this.Hyperion.redis.exists(`HighlightUser:${guild}:${user}`);
        if(result === 0){return true;}
        return false;
    }

    async setUserCooldown(user: string, guild: string): Promise<void>{
        await this.Hyperion.redis.set(`HighlightUser:${guild}:${user}`, 1, "EX", 5*60);
    }

    async checkGuildHighlight(guild: string, word: string): Promise<boolean>{
        const result = await this.Hyperion.redis.sismember(`Highlights:${guild}`, word.toLowerCase());
        if(result === 0){return false;}
        return true;
    }

    async parseHighlights(content: string, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        const split = content.split(" ");
        const found: Array<string> = [];
        for(const word of split){
            if(word.length < 4){continue;}
            if(await this.checkGuildHighlight(guild.id, word.toLowerCase())){found.push(word.toLowerCase());}
        }
        if(found.length === 0){return;}
        this.routeHighlights(found, guild, channel, msg);
    }

    async routeHighlights(highlights: Array<string>, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        for(const highlight of highlights){
            if(!await this.checkHighlightCooldown(guild.id, highlight.toLowerCase())){continue;}
            const subscribed = await this.Hyperion.managers.guilduser.raw().find({guild: guild.id, highlights: highlight.toLowerCase()}).lean<GuilduserType>().exec();
            const toDeliver: Array<string> = [];
            for(const user of subscribed){
                if(guild.members.has(user.user)){toDeliver.push(user.user);}
            }
            if(subscribed.length === 0){
                this.removeGuildHighlight(guild.id, highlight.toLowerCase());
                return;
            }
            this.deliverHighlights(toDeliver, highlight.toLowerCase(), guild, channel, msg);
            this.addHighlightCooldown(guild.id, highlight.toLowerCase());
        }

    }

    async deliverHighlights(users: Array<string>, highlight: string, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const messages: Array<Message> = channel.messages.map(m => m).sort((a, b) => b.timestamp - a.timestamp);
        let reference = "";
        for(let step = 4; step > -1; step--){
            if(!messages[step]?.author){continue;}
            reference += `${messages[step].author.username}#${messages[step].author.discriminator} - ${(messages[step].content === "" && messages[step].embeds.length > 0) ? "This message had an embed" : (messages[step].cleanContent!.length > 400 ? messages[step].cleanContent!.substr(0, 400) + "...": messages[step].cleanContent!)}\n`;
        }
        const data: EmbedResponse = {
            embed: {
                title: `Highlight for ${highlight} in ${guild.name}`,
                color: this.Hyperion.colors.blue,
                timestamp: new Date,
                description: `\`\`\`\n${reference}\`\`\``,
                fields: [
                    {
                        name: "Context Info",
                        value: `${highlight} was said by ${msg.author.username}#${msg.author.discriminator} in ${channel.mention}\n**[Jump to message](https://discord.com/channels/${guild.id}/${channel.id}/${msg.id})**`
                    }
                ],
                footer: {text: guild.name}
            }
        };
        for(const user of users){
            const userobj = guild.members.get(user);
            if(!userobj){continue;}
            if(!channel.permissionsOf(user).has("readMessages")){continue;}
            if(!await this.checkUserCooldown(user, guild.id)){continue;}
            userobj.user.getDMChannel().then(chan => chan.createMessage(data)).catch((err) => inspect(err));

        }
    }

    async addUserHighlight(user: string, guild: string, highlight: string): Promise<void>{
        if(!await this.Hyperion.managers.guilduser.raw().exists({guild: guild, user: user})){
            this.Hyperion.managers.guilduser.raw().create({
                guild: guild,
                user: user,
                highlights: [highlight.toLowerCase()],
                level: 0,
                exp: 0
            });
        }else{
            await this.Hyperion.managers.guilduser.raw().updateOne({guild: guild, user: user}, {$addToSet: {highlights: highlight.toLowerCase()}}).exec();
        }
        if(!await this.checkGuildHighlight(guild, highlight.toLowerCase())){
            this.addGuildHighlight(guild, highlight.toLowerCase());
        }
    }

    async removeUserHighlight(user: string, guild: string, highlight: string): Promise<void>{
        await this.Hyperion.managers.guilduser.raw().updateOne({guild: guild, user: user}, {$pull: {highlights: highlight.toLowerCase()}}).exec();
    }

    async getUserHighlights(user: string, guild: string): Promise<Array<string>>{
        if(!await this.Hyperion.managers.guilduser.raw().exists({guild: guild, user: user})){return ["No highlights set"];}
        const data = await this.Hyperion.managers.guilduser.raw().findOne({guild: guild, user: user}).exec();
        let out = data?.highlights ?? ["No highlights set"];
        if(out.length === 0){out = ["No highlights set"];}
        return out;
    }

}
export default Highlights;