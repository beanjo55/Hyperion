import {default as usermodel, IUser, IUserModel, IUserDoc} from "../../MongoDB/User";
import * as Types from "../../types";

class Acks implements Types.AckInterface{
    contrib: boolean;
    friend: boolean;
    staff: boolean;
    support: boolean;
    admin: boolean;
    developer: boolean;
    owner: boolean;
    custom: string;
    pro: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
    constructor(data: Partial<Types.AckInterface>){
        this.contrib = data.contrib ?? false;
        this.friend = data.friend ?? false;
        this.staff = data.staff ?? false;
        this.support = data.support ?? false;
        this.admin = data.admin ?? false;
        this.developer = data.developer ?? false;
        this.owner = data.owner ?? false;
        this.pro = data.pro ?? false;
        this.custom = data.custom ?? "";
    }
}

class MongoUserManager{
    model: IUserModel
    constructor(){
        this.model = usermodel;
    }
    async createConfig(user: string): Promise<IUserDoc>{
        return this.model.create({user: user});
    }

    async getUserConfig(user: string): Promise<IUser>{
        if(await this.model.exists({user: user})){
            const data = await this.model.findOne({user: user}).lean<IUser>().exec();
            return data!;
        }else{
            return await this.createConfig(user);
        }
    }
    async ensureExists(user: string): Promise<void>{
        if(!await this.model.exists({user: user})){
            await this.createConfig(user);
        }
    }
    async gotRep(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {rep: 1}});
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

    async setRep(user: string, amount: number): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {rep: amount});
    }
    async gaveRep(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {repGiven: 1}});
    }

    async getGivenRep(user: string): Promise<number>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return 0; }
        return doc.repGiven;
    }
    async setGivenRep(user: string, amount: number): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {repGiven: amount});
    }
    async changeMoney(user: string, amount: number): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {money: amount}});
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
    async setRepTime(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: Date.now()});
    }
    async setDailyTime(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: Date.now()});
    }
    async resetRepTime(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: 0});
    }
    async resetDailyTime(user: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: 0});
    }
    async setAcks(user: string, data: Partial<Types.AckInterface>): Promise<Types.IMongoUpdateResult>{
        let mdata = {};
        const doc = await this.getUserConfig(user);
        if(doc){
            mdata = this.merge(doc.acks, data);
        }
        const validated = new Acks(mdata);
        return await this.model.updateOne({user: user}, {acks: validated});
    }

    async getAcks(user: string): Promise<Types.AckInterface>{
        const doc = await this.getUserConfig(user);
        if(!doc){
            return new Acks({});
        }
        return new Acks(doc.acks);
    }
    async setPings(user: string, status: boolean): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {socailPings: status});
    }

    async getPingStatus(user: string): Promise<boolean>{
        const doc = await this.getUserConfig(user);
        if(!doc){ return true; }
        return doc.socialPings;
    }

    async getBio(user: string): Promise<string>{
        const doc = await this.getUserConfig(user);
        this.model.updateOne({user: user}, {});
        if(!doc){ return ""; }
        return doc.bio;
    }
    async setBio(user: string, bio: string): Promise<Types.IMongoUpdateResult>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {bio: bio});
    }
    async addExp(user: string, exp: number, levelFunc: (exp: number)=> number): Promise<{result: Types.IMongoUpdateResult; data: IUser; lvlUp: boolean}>{
        let lvlUp = false;
        const data = await this.getUserConfig(user);
        const totalExp = data!.exp + exp;
        const update: {exp: number; level?: number} = {exp: totalExp};
        const level = levelFunc(totalExp);
        if(level > data.level){update.level = level; lvlUp = true;}
        data.exp = totalExp;
        data.level = level;
        return {result: await this.model.updateOne({user: user}, update).exec(), data: data, lvlUp};

    }

    merge(oldData: {[key: string]: unknown}, newData: {[key: string]: unknown}): {[key: string]: unknown}{
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }
        
}

export { MongoUserManager as manager };