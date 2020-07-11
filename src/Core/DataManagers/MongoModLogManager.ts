/* eslint-disable @typescript-eslint/no-non-null-assertion */


import {default as model, IModLogModel, IModLog, IModLogDoc} from "../../MongoDB/Modlog";
import { IMongoUpdateResult, IModerationContext } from "../../types";
import {inspect} from "util";


class MongoModLogManager{
    model: IModLogModel
    constructor(){
        this.model = model;
    }

    async newCase(ctx: IModerationContext): Promise<IModLogDoc>{
        const data: IModLog = {
            guild: ctx.guild.id,
            user: ctx.user,
            moderator: ctx.moderator,
            moderationType: ctx.moderationType,
            mid: ctx.mid!,
            caseNumber: ctx.case!,
            auto: ctx.auto,
            timeGiven: Date.now(),
            reason: ctx.reason
        };
        if(ctx.stringLength){
            data.stringLength = ctx.stringLength;
        }
        if(ctx.length){
            data.duration = ctx.length;
        }
        if(ctx.role){
            data.role = ctx.role;
        }
        if(ctx.removedRoles){
            data.removedRoles = ctx.removedRoles;
        }
        return await this.model.create(data).catch(err => console.log(inspect(err) + "\n\n\n" + inspect(ctx))) as unknown as IModLogDoc;
    }

    async addMessageID(mid: string, id: string): Promise<IMongoUpdateResult>{
        return this.model.updateOne({mid: mid}, {logPost: id});
    }

    async markExpired(mid: string): Promise<IMongoUpdateResult>{
        return this.model.updateOne({mid: mid}, {expired: true});
    }

    async delwarn(guild: string, caseNum: number, userID: string, manager = false): Promise<IMongoUpdateResult>{
        const Case = await this.getCaseByCasenumber(guild, caseNum);
        if(!Case){throw new Error("I couldnt find that case");}
        if(!manager && Case.moderator !== userID){throw new Error("Only managers can delete warns they didnt make");}
        return await this.model.updateOne({mid: this.genMID(guild, caseNum)}, {revoked: true}).exec();
    }

    async clearwarn(guild: string, user: string): Promise<IMongoUpdateResult>{
        return await this.model.updateMany({guild: guild, user: user, moderationType: "warn"}, {revoked: true}).exec();
    }

    genMID(guild: string, caseNum: number): string{
        return `${guild}:${caseNum}`;
    }

    async getCaseByMID(MID: string): Promise<IModLog| null>{
        return await this.model.findOne({mid: MID}).lean<IModLog>().exec();
    }

    async getCaseByCasenumber(guild: string, caseNum: number): Promise<IModLog | null>{
        return await this.model.findOne({guild: guild, caseNumber: caseNum}).lean<IModLog>().exec();
    }

    async getMIDByCase(guild: string, caseNum: number): Promise<string | null>{
        const found: IModLog | null = await this.model.findOne({guild: guild, caseNumber: caseNum}).lean<IModLog>().exec();
        if(found?.mid){return found.mid;}
        return null;
    }
    
    async updateReason(mid: string, reason: string): Promise<IMongoUpdateResult>{
        return await this.model.updateOne({mid: mid}, {reason: reason});
    }

    async getUserModLogs(guild: string, user: string, limit?: number, filter?: string, hideAuto = true): Promise<Array<IModLog> | null>{
        let query = null;
        if(filter){
            if(hideAuto){
                query = this.model.find({guild: guild, user: user, moderationType: filter, auto: false}).sort({caseNumber: -1});
            }else{
                query = this.model.find({guild: guild, user: user, moderationType: filter}).sort({caseNumber: -1});
            }
            
        }else{
            if(hideAuto){
                query = this.model.find({auto: false, guild: guild, user: user}).sort({caseNumber: -1});
            }else{
                query = this.model.find({guild: guild, user: user}).sort({caseNumber: -1});
            }
        }
        if(limit){
            query = query.limit(limit);
        }
        return await query.lean<IModLog>().exec();
    }

    async getModActions(guild: string, user: string, filter?: string, limit?: number): Promise<Array<IModLog> | null>{
        let query = null;
        if(filter){
            query = this.model.find({guild: guild, moderator: user, moderationType: filter});
        }else{
            query = this.model.find({guild: guild, moderator: user});
        }
        if(limit){
            query = query.limit(limit);
        }
        return await query.lean<IModLog>().exec();
    }

    async moderationCount(guild: string, user: string): Promise<Array<number>>{
        const total = await this.model.find({guild: guild, user: user}).countDocuments().exec();
        const auto = await this.model.find({guild: guild, user: user, auto: true}).countDocuments().exec();
        return [total, total - auto, auto];
    }
}

export {MongoModLogManager as manager};