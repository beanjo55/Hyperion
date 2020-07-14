import { Guild, GuildTextableChannel, Message} from "eris";
import {Module} from "../../Core/Structures/Module";
import { EmbedResponse, IHyperion } from "../../types";
import {IGuildUser, IGuildUserModel, default as gumodel} from "../../MongoDB/Guilduser";
import {inspect} from "util";

class Highlights extends Module{
    model: IGuildUserModel;
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
        this.model = gumodel;
    }

    async messageCreate(Hyperion: IHyperion, msg: Message): Promise<void>{
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        const count = await this.Hyperion.redis.scard(`Highlights:${guild.id}`);
        if(count === 0){return;}
        await this.setUserCooldown(msg.author.id, guild.id);
        this.parseHighlights(msg.content, guild, msg.channel, msg);
    }

    async addGuildHighlight(guild: string, highlight: string): Promise<void>{
        const exists = await this.Hyperion.redis.sismember(`Highlights:${guild}`, highlight);
        if(exists){
            throw new Error("Highlight already exists");
        }
        await this.Hyperion.redis.sadd(`Highlights:${guild}`, highlight);
    }

    async removeGuildHighlight(guild: string, highlight: string, ): Promise<void>{
        const exists = await this.Hyperion.redis.sismember(`Highlights:${guild}`, highlight);
        if(!exists){
            throw new Error("Highlight doesnt exist");
        }
        await this.Hyperion.redis.srem(`Highlights:${guild}`, highlight);
    }

    async addHighlightCooldown(guild: string, word: string): Promise<void>{
        this.Hyperion.redis.set(`HighlightCooldown:${guild}:${word}`, 1, "EX", 60*5);
    }

    async checkHighlightCooldown(guild: string, word: string): Promise<boolean>{
        const result = await this.Hyperion.redis.get(`HighlightCooldown:${guild}:${word}`);
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
        const result = await this.Hyperion.redis.sismember(`Highlights:${guild}`, word);
        if(result === 0){return false;}
        return true;
    }

    async parseHighlights(content: string, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        const split = content.split(" ");
        const found: Array<string> = [];
        for(const word of split){
            if(word.length < 4){continue;}
            if(await this.checkGuildHighlight(guild.id, word.toLowerCase())){found.push(word);}
        }
        if(found.length === 0){return;}
        this.routeHighlights(found, guild, channel, msg);
    }

    async routeHighlights(highlights: Array<string>, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        for(const highlight of highlights){
            if(!await this.checkHighlightCooldown(guild.id, highlight)){continue;}
            const subscribed = await this.model.find({guild: guild.id, highlights: highlight}).lean<IGuildUser>().exec();
            const toDeliver: Array<string> = [];
            for(const user of subscribed){
                if(guild.members.has(user.user)){toDeliver.push(user.user);}
            }
            if(subscribed.length === 0){
                this.removeGuildHighlight(guild.id, highlight);
                return;
            }
            this.deliverHighlights(toDeliver, highlight, guild, channel, msg);
            this.addHighlightCooldown(guild.id, highlight);
        }

    }

    async deliverHighlights(users: Array<string>, highlight: string, guild: Guild, channel: GuildTextableChannel, msg: Message): Promise<void>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
                        value: `${highlight} was said by ${msg.author.username}#${msg.author.discriminator} in ${channel.mention}
                        **[Jump to message](https://discord.com/channels/${guild.id}/${channel.id}/${msg.id})**`
                    }
                ],
                footer: {text: guild.name}
            }
        };
        console.log(inspect(users));
        for(const user of users){
            const userobj = guild.members.get(user);
            if(!userobj){continue;}
            if(!channel.permissionsOf(user).has("readMessages")){continue;}
            console.log("found user");
            if(!await this.checkUserCooldown(user, guild.id)){continue;}
            console.log("about to send");
            userobj.user.getDMChannel().then(chan => chan.createMessage(data)).catch((err) => inspect(err));

        }
    }

    async addUserHighlight(user: string, guild: string, highlight: string): Promise<void>{
        if(!await this.model.exists({guild: guild, user: user})){
            this.model.create({
                guild: guild,
                user: user,
                highlights: [highlight]
            });
        }else{
            await this.model.updateOne({guild: guild, user: user}, {$addToSet: {highlights: highlight}}).exec();
        }
        if(!await this.checkGuildHighlight(guild, highlight)){
            this.addGuildHighlight(guild, highlight);
        }
    }

    async removeUserHighlight(user: string, guild: string, highlight: string): Promise<void>{
        await this.model.updateOne({guild: guild, user: user}, {$pull: {highlights: highlight}}).exec();
    }

    async getUserHighlights(user: string, guild: string): Promise<Array<string>>{
        if(!await this.model.exists({guild: guild, user: user})){return ["No highlights set"];}
        const data = await this.model.findOne({guild: guild, user: user}).exec();
        return data?.highlights ?? ["No highlights set"];
    }

}
export default Highlights;