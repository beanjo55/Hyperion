import { Message } from "eris";
import {Module} from "../../Core/Structures/Module";
import { EmbedResponse, IHyperion, QuoteConfig } from "../../types";

class Quotes extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "quotes",
            friendlyName: "Quotes",
            private: false,
            hasCommands: false,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname,
            defaultStatus: false,
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(Hyperion: IHyperion, msg: Message): Promise<void>{
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const channel = msg.channel;
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.Hyperion.managers.guild.getModuleConfig<QuoteConfig>(guild.id, this.name);
        if(config.quoteLinks === undefined || config.quoteLinks === false){return;}
        const rx = new RegExp(/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/, "gmi");
        const result = rx.exec(msg.content);
        if(result === null){return;}
        if(result[3] !== guild.id){return msg.addReaction("error:732383200436813846").catch(() => undefined);}
        const targetChannel = guild.channels.get(result[4]);
        if(!targetChannel){return msg.addReaction("error:732383200436813846").catch(() => undefined);}
        if(!(targetChannel.type === 5 || targetChannel.type === 0)){return msg.addReaction("error:732383200436813846").catch(() => undefined);}
        const targetMessage = targetChannel.messages.get(result[5]) ?? await targetChannel.getMessage(result[5]).catch(() => undefined);
        if(!targetMessage){return msg.addReaction("error:732383200436813846").catch(() => undefined);}

        const data: Partial<EmbedResponse> = {
            embed: {
                author: {name: targetMessage.author.username + "#" + targetMessage.author.discriminator, icon_url: targetMessage.author.avatarURL},
                description: `Message by ${targetMessage.author.username}#${targetMessage.author.discriminator} in ${targetChannel.mention}: **[Jump](https://discord.com/channels/${result[3]}/${result[4]}/${result[5]})**\n${targetMessage.content}${targetMessage.embeds.length !== 0 ? "\n **This message had an embed**" : ""}`,
                color: this.Hyperion.colors.default,
                timestamp: new Date
            }
        };
        if(targetMessage.attachments.length !== 0){
            const att = targetMessage.attachments[0];
            if(att.url.endsWith(".png") || att.url.endsWith(".jpg") || att.url.endsWith(".gif")){data.embed!.image = {url: att.url};}
        }
        if(!data.embed?.image && targetMessage.embeds.length !== 0){
            if(targetMessage.embeds[0].image){
                data.embed!.image = {url: targetMessage.embeds[0].image.url};
            }
        }
        channel.createMessage(data).catch(() => undefined);
    }
}
export default Quotes;