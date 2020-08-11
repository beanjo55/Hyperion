
/* eslint-disable @typescript-eslint/no-empty-function */
import {default as model, IGuildUser, IGuildUserDoc, IGuildUserModel} from "../../MongoDB/Guilduser";
import {levelUpdateResult } from "../../types";

export default class MongoGuildUserManager{
    model: IGuildUserModel;
    constructor(){this.model = model;}

    async addExp(user: string, guild: string, exp: number, levelFunc: (exp: number)=> number): Promise<levelUpdateResult>{
        let lvlUp = false;
        const data = await this.getUserConfig(user, guild);
        if(data.level === null){data.level = 0;}
        if(data.exp === null){data.exp = 0;}
        const totalExp = data!.exp + exp;
        const update: {exp: number; level?: number} = {exp: totalExp};
        const level = levelFunc(totalExp);
        if(level > data.level){update.level = level; lvlUp = true;}
        const result = await this.model.updateOne({user: user, guild: guild}, update).exec();
        data.exp = totalExp;
        data.level = level;
        return {result: result, data: data, lvlUp};

    }
    async createConfig(user: string, guild: string): Promise<IGuildUserDoc>{
        return this.model.create({user: user, guild: guild});
    }

    async getUserConfig(user: string, guild: string): Promise<IGuildUser>{
        if(await this.model.exists({user: user})){
            const data = await this.model.findOne({user: user, guild: guild}).lean<IGuildUser>().exec();
            return data!;
        }else{
            return await this.createConfig(user, guild);
        }
    }

    async getExpData(user: string, guild: string): Promise<{exp: number; level: number}>{
        const data = await this.getUserConfig(user, guild);
        if(!data){return {exp: 0, level: 0};}
        return {exp: data.exp, level: data.level};
    }
}
