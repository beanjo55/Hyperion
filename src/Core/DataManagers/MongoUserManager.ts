import {default as usermodel} from "../../MongoDB/User";
// eslint-disable-next-line no-unused-vars
import * as Types from "../../types";


class MongoUserManager{
    model: any
    constructor(){
        this.model = usermodel;
    }

    async createConfig(user: string){
        return this.model.create({user: user});
    }

    async getUserConfig(user: string): Promise<Types.UserConfig>{
        if(await this.model.exists({user: user})){
            return await this.model.findOne({user: user}).lean().exec();
        }else{
            return await this.createConfig(user);
        }
    }

    async ensureExists(user: string){
        if(!await this.model.exists({user: user})){
            return await this.createConfig(user);
        }
    }

    async gotRep(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {rep: 1}});
    }

    async getRep(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.rep;
    }

    async setRep(user: string, amount: number){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {rep: amount});
    }

    async gaveRep(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {$inc: {repGiven: 1}});
    }

    async getGivenRep(user: string): Promise<number>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.repGiven;
    }

    async setGivenRep(user: string, amount: number){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {repGiven: amount});
    }

    async changeMoney(user: string, amount: number){
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

    async setRepTime(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: Date.now()});
    }

    async setDailyTime(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: Date.now()});
    }

    async resetRepTime(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastRepTime: 0});
    }

    async resetDailyTime(user: string){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {lastDailyTime: 0});
    }

    async setAcks(user: string, data: Types.AckInterface){
        const validated = new Acks(data);
        return await this.model.updateOne({user: user}, {acks: validated});
    }

    async getAcks(user: string): Promise<Types.AckInterface>{
        const doc: Types.UserConfig | any = await this.getUserConfig(user);
        if(!doc){
            doc.acks = {};
        }
        return new Acks(doc.acks);
    }

    async setPings(user: string, status: boolean){
        await this.ensureExists(user);
        return await this.model.updateOne({user: user}, {socailPings: status});
    }

    async getPingStatus(user: string): Promise<boolean>{
        const doc: Types.UserConfig = await this.getUserConfig(user);
        return doc.socialPings;
    }
        
}

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

export {MongoUserManager as manager};