import {Module} from "../../Structures/Module";
import { Embed } from "eris";
import {IHyperion } from "../../types";
import {randomInt} from "mathjs";
import { EmbedType } from "../../../main";

type EmbedMap = Map<string, CustomEmbed>;

export class CustomEmbed{
    embed: Partial<Embed>;
    randoms: Array<string>;
    timestamp: boolean | number;
    constructor(data: Partial<CustomEmbed>){
        this.embed = data.embed ?? {};
        this.randoms = data.randoms ?? [];
        this.timestamp = data.timestamp ?? false;
    }
}


class Embeds extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "embeds",
            hasCommands: true,
            friendlyName: "Embeds",
            defaultStatus: false,
            dirname: __dirname
        }, Hyperion);
    }

    async getGuildEmbedData(guild: string): Promise<EmbedType | null>{
        return await this.Hyperion.managers.embeds.raw().findOne({guild: guild}).exec();
    }

    async createGuildEmbedDoc(guild: string): Promise<void>{
        this.Hyperion.managers.embeds.raw().create({guild: guild, embeds: new Map(), limit: 15});
    }

    async getGuildEmbedMap(guild: string, guildData?: EmbedType | null): Promise<EmbedMap>{
        if(!guildData){guildData = await this.getGuildEmbedData(guild);}
        if(!guildData){
            this.createGuildEmbedDoc(guild);
            return new Map<string, CustomEmbed>();
        }else{
            if(!(guildData.embeds instanceof Map)){guildData.embeds = new Map<string, CustomEmbed>([...Object.entries(guildData.embeds)]);}
            return guildData.embeds as Map<string, CustomEmbed>;
        }
    }

    async setGuildLimit(guild: string, newLimit: number): Promise<EmbedType>{
        return await this.Hyperion.managers.embeds.raw().updateOne({guild: guild}, {limit: newLimit}).exec();
    }

    async getGuildLimit(guild: string, guildData?: EmbedType | null): Promise<number>{
        if(!guildData){guildData = await this.getGuildEmbedData(guild);}
        if(!guildData){
            return 15;
        }else{
            return guildData.limit;
        }
    }

    async getEmbedCount(guild: string, embeds?: EmbedMap): Promise<number>{
        if(!embeds){ embeds = await this.getGuildEmbedMap(guild);}
        return embeds.size;
    }

    async getEmbedNames(guild: string, embeds?: EmbedMap): Promise<Array<string>>{
        if(!embeds){ embeds = await this.getGuildEmbedMap(guild);}
        console.log(embeds);
        const out: Array<string> = [];
        for(const name of embeds.keys()){
            out.push(name);
        }
        return out;
    }

    async saveGuildEmbeds(guild: string, guildEmbeds: EmbedMap): Promise<EmbedType>{
        return await this.Hyperion.managers.embeds.raw().updateOne({guild: guild}, {embeds: guildEmbeds}).exec();
    }

    async addNewEmbed(guild: string, name: string): Promise<EmbedType>{
        const guildEmbedData = await this.getGuildEmbedData(guild);
        let embeds = guildEmbedData?.embeds;
        let limit = guildEmbedData?.limit;
        if(!embeds){embeds = await this.getGuildEmbedMap(guild, guildEmbedData);}
        if(!limit){limit = await this.getGuildLimit(guild, guildEmbedData);}
        if(!(embeds instanceof Map)){embeds = new Map<string, CustomEmbed>([...Object.entries(embeds)]);}
        if(embeds.has(name)){throw new Error("An embed by that name already exists in the guild.");}
        if(embeds.size+1 > limit){throw new Error("Can not add more embeds than the limit allows.");}
        embeds.set(name, new CustomEmbed({}));
        return await this.Hyperion.managers.embeds.raw().updateOne({guild: guild}, {embeds: embeds}).exec();
    }

    async getEmbed(guild: string, name: string, embeds?: EmbedMap): Promise<CustomEmbed>{
        if(!embeds){embeds = await this.getGuildEmbedMap(guild);}
        const out = embeds.get(name);
        if(!out){throw new Error("Could not find an embed by that name in that guild.");}
        return out;
    }

    async updateEmbed(guild: string, name: string, newEmbed: CustomEmbed, guildEmbeds?: EmbedMap): Promise<EmbedType>{
        if(!guildEmbeds){guildEmbeds = await this.getGuildEmbedMap(guild);}
        if(!guildEmbeds.has(name)){throw new Error("Cannot update an embed that does not exist.");}
        guildEmbeds.set(name, newEmbed);
        return await this.saveGuildEmbeds(guild, guildEmbeds);
    }

    formatRandoms(data: CustomEmbed): Partial<Embed>{
        if(!data.randoms || data.randoms.length === 0){return data.embed;}
        const rx = new RegExp(/{random}/, "gi");
        if(data.embed?.description){data.embed.description = data.embed.description.replace(rx, this.getRandom(data.randoms));}
        if(data.embed.fields && data.embed.fields.length !== 0){
            data.embed.fields.forEach((field, index) => {
                data.embed.fields![index].name = field.name.replace(rx, this.getRandom(data.randoms));
                data.embed.fields![index].value = field.value.replace(rx, this.getRandom(data.randoms));
            });
        }
        if(data.embed.footer && data.embed.footer?.text){
            data.embed.footer.text = data.embed.footer.text.replace(rx, this.getRandom(data.randoms));
        }

        if(data.embed.author && data.embed.author?.name){
            data.embed.author.name = data.embed.author.name.replace(rx, this.getRandom(data.randoms));
        }

        if(data.embed.title){
            data.embed.title = data.embed.title.replace(rx, this.getRandom(data.randoms));
        }

        return data.embed;
    }

    getRandom(randoms: Array<string>): string{
        return randoms[randomInt(0, randoms.length)];
    }

    //other modules (and normal usage i guess) use this method to get embeds
    async requestEmbed(guild: string, name: string): Promise<undefined | Partial<Embed>>{
        const guildEmbeds = await this.getGuildEmbedMap(guild);
        const embed = await this.getEmbed(guild, name, guildEmbeds);
        if(embed.timestamp){
            if(typeof(embed.timestamp) === "number"){
                embed.embed.timestamp = new Date(embed.timestamp);
            }else{
                embed.embed.timestamp = new Date;
            }
        }
        if(embed.randoms){
            return this.formatRandoms(embed);
        }else{
            return embed.embed;
        }
    }
    
}

export default Embeds;