
/* eslint-disable @typescript-eslint/no-empty-function */
import {levelUpdateResult } from "../types";
import hyperion, {GuilduserType} from "../../main";
import { Model, Document } from "mongoose";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class MongoGuildUserManager{
    Hyperion: hyperion;
    constructor(newHype: hyperion){this.Hyperion = newHype;}

    async addExp(user: string, guild: string, exp: number, levelFunc: (exp: number)=> number): Promise<levelUpdateResult>{
        let lvlUp = false;
        let data = await this.Hyperion.manager.guilduser(guild, user).get();
        if(data === null){
            data = {level: 0, exp: 0, guild, user, highlights: []};
            const result = await this.Hyperion.manager.guilduser(guild, user).create(data);
            const level = levelFunc(exp);
            if(level > 0){lvlUp = true;}
            return {data: result, lvlUp};
        }
        const totalExp = data!.exp + exp;
        const update: {exp: number; level?: number} = {exp: totalExp};
        const level = levelFunc(totalExp);
        if(level > data.level){update.level = level; lvlUp = true;}
        data.exp = totalExp;
        data.level = level;
        if(!data.user){data.user = user;}
        if(!data.guild){data.guild = guild;}
        await sleep(1000);
        data = await this.Hyperion.manager.guilduser(guild, user).update(data);
        return {data, lvlUp};

    }
    async createConfig(user: string, guild: string): Promise<GuilduserType>{
        return await this.Hyperion.manager.guilduser(guild, user).create();
    }

    async getUserConfig(user: string, guild: string): Promise<GuilduserType>{
        return await this.Hyperion.manager.guilduser(guild, user).getOrCreate();
    }

    async getExpData(user: string, guild: string): Promise<{exp: number; level: number}>{
        const data = await this.getUserConfig(user, guild);
        if(!data){return {exp: 0, level: 0};}
        if(!data.user){data.user = user;}
        if(!data.guild){data.guild = guild;}
        return {exp: data.exp, level: data.level};
    }

    raw(): Model<GuilduserType & Document> {
        return this.Hyperion.manager.guilduser("dummy", "dummy").raw() as Model<GuilduserType & Document>;
    }
}
