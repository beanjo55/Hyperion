
import {IModerationContext } from "../types";
import hyperion, {modLogType} from "../../main";
import { Model, Document } from "mongoose";

type types = "ban" | "kick" | "softban" | "mute" | "unmute" | "unban" | "warn" | "persist" | "lock" | "unlock";


class MongoModLogManager{
    Hyperion: hyperion;
    constructor(newHype: hyperion){
        this.Hyperion = newHype;
    }

    async newCase(ctx: IModerationContext): Promise<modLogType>{
        const data: modLogType = {
            guild: ctx.guild.id,
            user: ctx.user,
            moderator: ctx.moderator,
            moderationType: ctx.moderationType as types,
            mid: ctx.mid!,
            caseNumber: ctx.caseNumber!,
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
        return await this.Hyperion.manager.modlogs().create(data);
    }

    async removeModerationTime(mid: string): Promise<void>{
        await this.Hyperion.manager.modlogs().update(mid, {duration: 0, stringLength: ""});
    }

    async updateModerationTime(mid: string, length: number, stringLength: string): Promise<void>{
        await this.Hyperion.manager.modlogs().update(mid, {duration: length, stringLength});
    }

    async addMessageID(mid: string, id: string, channelID: string): Promise<void>{
        await this.Hyperion.manager.modlogs().update(mid, {logPost: id, logChannel: channelID});
    }

    async markExpired(mid: string): Promise<void>{
        await this.Hyperion.manager.modlogs().update(mid, {expired: true});
    }

    async markMutesExpired(user: string, guild: string): Promise<void>{
        await this.Hyperion.manager.modlogs().raw().updateMany({guild: guild, user: user, expired: false, moderationType: "mute"}, {expired: true});
    }

    /*
    async delwarn(guild: string, caseNum: number, userID: string, manager = false): Promise<IMongoUpdateResult>{
        const Case = await this.getCaseByCasenumber(guild, caseNum);
        if(!Case){throw new Error("I couldnt find that case");}
        if(!manager && Case.moderator !== userID){throw new Error("Only managers can delete warns they didnt make");}
        return await this.model.updateOne({mid: this.genMID(guild, caseNum)}, {revoked: true}).exec();
    }

    async clearwarn(guild: string, user: string): Promise<IMongoUpdateResult>{
        return await this.model.updateMany({guild: guild, user: user, moderationType: "warn"}, {revoked: true}).exec();
    }*/


    genMID(guild: string, caseNum: number): string{
        return `${guild}:${caseNum}`;
    }

    async getCaseByMID(MID: string): Promise<modLogType | null>{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return await this.Hyperion.manager.modlogs().get(MID).catch(_c => null);
    }

    async getCaseByCasenumber(guild: string, caseNum: number): Promise<modLogType | null>{
        return await (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).findOne({guild: guild, caseNumber: caseNum}).lean<modLogType>().exec();
    }

    async getMIDByCase(guild: string, caseNum: number): Promise<string | null>{
        const found: modLogType | null =  await (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).findOne({guild: guild, caseNumber: caseNum}).lean<modLogType>().exec();
        if(found?.mid){return found.mid;}
        return null;
    }
    
    async updateReason(mid: string, reason: string): Promise<modLogType>{
        return await this.Hyperion.manager.modlogs().update(mid, {reason});
    }

    async getUserModLogs(guild: string, user: string, options: {hideAuto: boolean; filter?: string; page: number, limit?: number}): Promise<Array<modLogType> | null>{
        const query = (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).find({guild: guild, user: user});
        
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
        return await query.sort({caseNumber: -1}).lean<modLogType>().exec();
    }

    async getModActions(guild: string, user: string, options: {hideAuto: boolean; filter?: string; page: number, limit?: number}): Promise<Array<modLogType> | null>{
        const query = (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).find({guild: guild, moderator: user});
        
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
        return await query.sort({caseNumber: -1}).lean<modLogType>().exec();
    }

    async moderationCount(guild: string, user: string): Promise<Array<number>>{
        const total = await (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).find({guild: guild, user: user}).countDocuments().exec();
        const auto = await (this.Hyperion.manager.modlogs().raw() as unknown as Model<Document & modLogType>).find({guild: guild, user: user, auto: true}).countDocuments().exec();
        return [total, total - auto, auto];
    }

    raw(): Model<modLogType & Document> {
        return this.Hyperion.manager.modlogs().raw() as Model<modLogType & Document>;
    }
}

export {MongoModLogManager as manager};