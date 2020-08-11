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
            reason: ctx.reason,
            autoEnd: ctx.autoEnd
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

    async removeModerationTime(mid: string): Promise<void>{
        await this.model.updateOne({mid: mid}, {length: 0, stringLength: ""});
    }

    async updateModerationTime(mid: string, length: number, stringLength: string): Promise<void>{
        await this.model.updateOne({mid: mid}, {length: length, stringLength: stringLength});
    }

    async addMessageID(mid: string, id: string, channelID: string): Promise<IMongoUpdateResult>{
        return this.model.updateOne({mid: mid}, {logPost: id, logChannel: channelID});
    }

    async markExpired(mid: string): Promise<IMongoUpdateResult>{
        return this.model.updateOne({mid: mid}, {expired: true});
    }

    async markMutesExpired(user: string, guild: string): Promise<void>{
        await this.model.updateMany({guild: guild, user: user, expired: false, moderationType: "mute"}, {expired: true});
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

    async setExpired(mid: string): Promise<void>{
        await this.model.updateOne({mid: mid}, {expired: true}).exec();
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

    async getUserModLogs(guild: string, user: string, options: {hideAuto: boolean; filter?: string; page: number, limit?: number}): Promise<Array<IModLog> | null>{
        const query = this.model.find({guild: guild, user: user});
        
        if(options.hideAuto !== undefined && options.hideAuto === true){
            query.where({auto: false});
        }
        if(options.filter !== undefined){
            query.where({moderationType: options.filter});
        }
        if(options.page !== undefined){
            if(options.page !== 0){
                query.skip(25*options.page);
            }
        }else{
            query.limit(options.limit ?? 25);
        }
        return await query.sort({caseNumber: -1}).lean<IModLog>().exec();
    }

    async getModActions(guild: string, user: string, options: {hideAuto: boolean; filter?: string; page: number, limit?: number}): Promise<Array<IModLog> | null>{
        const query = this.model.find({guild: guild, moderator: user});
        
        if(options.hideAuto !== undefined && options.hideAuto === true){
            query.where({auto: false});
        }
        if(options.filter !== undefined){
            query.where({moderationType: options.filter});
        }
        if(options.page !== undefined){
            if(options.page !== 0){
                query.skip(25*options.page);
            }
        }else{
            query.limit(options.limit ?? 25);
        }
        return await query.sort({caseNumber: -1}).lean<IModLog>().exec();
    }

    async moderationCount(guild: string, user: string): Promise<Array<number>>{
        const total = await this.model.find({guild: guild, user: user}).countDocuments().exec();
        const auto = await this.model.find({guild: guild, user: user, auto: true}).countDocuments().exec();
        return [total, total - auto, auto];
    }
}

export {MongoModLogManager as manager};