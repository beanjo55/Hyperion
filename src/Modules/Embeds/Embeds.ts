import {Module} from "../../Core/Structures/Module";
import { Embed } from "eris";
import {IEmbed, IEmbedDoc, IEmbedModel, default as model} from "../../MongoDB/Embeds";
import { IMongoUpdateResult, IHyperion } from "../../types";
import {randomInt} from "mathjs";

type EmbedMap = Map<string, CustomEmbed>;

export class CustomEmbed{
    embed: Partial<Embed>;
    randoms: Array<string>
    constructor(data: Partial<CustomEmbed>){
        this.embed = data.embed ?? {};
        this.randoms = data.randoms ?? [];
    }
}


class Embeds extends Module{
    model: IEmbedModel;
    constructor(Hyperion: IHyperion){
        super({
            name: "embeds",
            hasCommands: true,
            friendlyName: "Embeds",
            defaultStatus: false,
            dirname: __dirname
        }, Hyperion);
        this.model = model;
    }

    async getGuildEmbedData(guild: string): Promise<IEmbedDoc | null>{
        return await this.model.findOne({guild: guild}).exec();
    }

    async createGuildEmbedDoc(guild: string): Promise<void>{
        this.model.create({guild: guild, embeds: new Map()});
    }

    async getGuildEmbedMap(guild: string, guildData?: IEmbedDoc | null): Promise<EmbedMap>{
        if(!guildData){guildData = await this.getGuildEmbedData(guild);}
        if(!guildData){
            this.createGuildEmbedDoc(guild);
            return new Map<string, CustomEmbed>();
        }else{
            return guildData.embeds;
        }
    }

    async setGuildLimit(guild: string, newLimit: number): Promise<IMongoUpdateResult>{
        return await this.model.updateOne({guild: guild}, {limit: newLimit}).exec();
    }

    async getGuildLimit(guild: string, guildData?: IEmbedDoc | null): Promise<number>{
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

    async saveGuildEmbeds(guild: string, guildEmbeds: EmbedMap): Promise<IMongoUpdateResult>{
        return await this.model.updateOne({guild: guild}, {embeds: guildEmbeds}).exec();
    }

    async addNewEmbed(guild: string, name: string): Promise<IMongoUpdateResult>{
        const guildEmbedData = await this.getGuildEmbedData(guild);
        let embeds = guildEmbedData?.embeds;
        let limit = guildEmbedData?.limit;
        if(!embeds){embeds = await this.getGuildEmbedMap(guild, guildEmbedData);}
        if(!limit){limit = await this.getGuildLimit(guild, guildEmbedData);}
        if(embeds.has(name)){throw new Error("An embed by that name already exists in the guild.");}
        if(embeds.size+1 > limit){throw new Error("Can not add more embeds than the limit allows.");}
        embeds.set(name, new CustomEmbed({}));
        return await this.model.updateOne({guild: guild}, {embeds: embeds}).exec();
    }

    async getEmbed(guild: string, name: string, embeds?: EmbedMap): Promise<CustomEmbed>{
        if(!embeds){embeds = await this.getGuildEmbedMap(guild);}
        const out = embeds.get(name);
        if(!out){throw new Error("Could not find an embed by that name in that guild.");}
        return out;
    }

    async updateEmbed(guild: string, name: string, newEmbed: CustomEmbed, guildEmbeds?: EmbedMap): Promise<IMongoUpdateResult>{
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
        if(embed.randoms){
            return this.formatRandoms(embed);
        }else{
            return embed.embed;
        }
    }
    
}

export default Embeds;