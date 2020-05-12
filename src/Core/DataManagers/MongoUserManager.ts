import {default as usermodel} from "../../MongoDB/User";
// eslint-disable-next-line no-unused-vars
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
    constructor(data: Partial<Types.AckInterface>){
        this.contrib = data.contrib ?? false;
        this.friend = data.friend ?? false;
        this.staff = data.staff ?? false;
        this.support = data.support ?? false;
        this.admin = data.admin ?? false;
        this.developer = data.developer ?? false;
        this.owner = data.owner ?? false;
        this.custom = data.custom ?? "";
    }
}

class MongoUserManager{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any
    constructor(){
        this.model = usermodel;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createConfig(user: string): Promise<any>{
        return this.model.create({user: user});
    }

    async getUserConfig(user: string): Promise<Types.UserConfig>{
        if(await this.model.exists({user: user})){
            return await this.model.findOne({user: user}).lean().exec();
        }else{
            return await this.createConfig(user);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async ensureExists(user: string): Promise<any>{
        if(!await this.model.exists({user: user})){
            return await this.createConfig(user);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async gotRep(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {rep: 1}});
    }

    async getRep(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.rep;
    }

    async getMoney(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.money;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setRep(user: string, amount: number): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {rep: amount});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async gaveRep(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {repGiven: 1}});
    }

    async getGivenRep(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.repGiven;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setGivenRep(user: string, amount: number): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {repGiven: amount});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async changeMoney(user: string, amount: number): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {money: amount}});
    }

    async getRepTime(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.lastRepTime;
    }

    async getDailyTime(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.lastDailyTime;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setRepTime(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: Date.now()});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setDailyTime(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: Date.now()});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async resetRepTime(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: 0});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async resetDailyTime(user: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: 0});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setAcks(user: string, data: Types.AckInterface): Promise<any>{
        let mdata = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc: Types.UserConfig | any = await this.getUserConfig(user);
        if(doc){
            mdata = this.merge(doc.acks, data);
        }
        const validated = new Acks(mdata);
        return await this.model.updateOne({user: user}, {acks: validated});
    }

    async getAcks(user: string): Promise<Types.AckInterface>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc: Types.UserConfig | any = await this.getUserConfig(user);
        if(!doc){
            doc.acks = {};
        }
        return new Acks(doc.acks);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setPings(user: string, status: boolean): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {socailPings: status});
    }

    async getPingStatus(user: string): Promise<boolean>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.socialPings;
    }

    async getBio(user: string): Promise<string>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        this.model.updateOne({user: user});
        return doc.bio;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setBio(user: string, bio: string): Promise<any>{
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {bio: bio});
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merge(oldData: any, newData: any): any{
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }
        
}

export {MongoUserManager as manager};