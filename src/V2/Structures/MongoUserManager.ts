import { Document, Model } from "mongoose";
import hyperion, {UserType} from "../../main";
import { ack } from "../../Structures/Utils";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class MongoUserManager{
    Hyperion: hyperion;
    constructor(newHype: hyperion){
        this.Hyperion = newHype;
    }
    async createConfig(user: string): Promise<UserType>{
        return await this.Hyperion.manager.user().get(user);
    }

    async getUserConfig(user: string): Promise<UserType>{
        return await this.Hyperion.manager.user().get(user);
    }
    async gotRep(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.rep++;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }

    async getRep(user: string): Promise<number>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.rep;
    }

    async getMoney(user: string): Promise<number>{ 
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.money;
    }

    async setRep(user: string, amount: number): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.rep = amount;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async gaveRep(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.repGiven++;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }

    async getGivenRep(user: string): Promise<number>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.repGiven;
    }
    async setGivenRep(user: string, amount: number): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.repGiven = amount;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async changeMoney(user: string, amount: number): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.money = amount;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }

    async getRepTime(user: string): Promise<number>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.lastRepTime;
    }

    async getDailyTime(user: string): Promise<number>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.lastDailyTime;
    }
    async setRepTime(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.lastRepTime = Date.now();
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async setDailyTime(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.lastDailyTime = Date.now();
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async resetRepTime(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.lastRepTime = 0;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async resetDailyTime(user: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.lastDailyTime = 0;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }
    async setAcks(user: string, data: Partial<ack>): Promise<ack>{
        const oldData = await this.Hyperion.utils.getAcks(user);
        for(const key of Object.keys(oldData) as Array<keyof ack>){
            if(data[key] !== undefined && data[key] !== oldData[key]){
                if(key === "custom"){
                    this.Hyperion.utils.setAcks(user, "custom", data[key]!);
                    oldData.custom = data.custom;
                }else{
                    this.Hyperion.utils.setAcks(user, key, data[key]!);
                    oldData[key] = data[key]!;
                }
            }
        }
        return oldData;
    }

    async getAcks(user: string): Promise<ack>{
        return await this.Hyperion.utils.getAcks(user);
    }


    async getBio(user: string): Promise<string>{
        const doc = await this.getUserConfig(user);
        if(!doc?.bio){ return ""; }
        return doc.bio;
    }

    async setBio(user: string, bio: string): Promise<UserType>{
        const data = await this.getUserConfig(user);
        data.bio = bio;
        if(!data.user){data.user = user;}
        return await this.Hyperion.manager.user().update(user, data);
    }

    async addExp(user: string, exp: number, levelFunc: (exp: number)=> number): Promise<{data: UserType; lvlUp: boolean}>{
        let lvlUp = false;
        let data = await this.Hyperion.manager.user().get(user);
        if(data === null){
            data = {level: 0, exp: 0, user, rep: 0, repGiven: 0, lastRepTime: 0, lastDailyTime: 0, money: 0};
            const result = await this.Hyperion.manager.user().get(user);
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
        sleep(1000);
        data = await this.Hyperion.manager.user().update(user, data);
        return {data: data, lvlUp};

    }

    merge(oldData: {[key: string]: unknown}, newData: {[key: string]: unknown}): {[key: string]: unknown}{
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }

    raw(): Model<UserType & Document> {
        return this.Hyperion.manager.user().raw();
    }
        
}

export { MongoUserManager as manager };