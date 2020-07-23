/* eslint-disable @typescript-eslint/no-empty-interface */
import {Schema, model, Model, Document} from "mongoose";


const ModerationSchema = new Schema({

    mid: {
        type: String,
        unique: true,
        required: true
    },

    guild: {
        type: String,
        required: true,
        index: true
    },

    user: {
        type: String,
        required: true
    },

    caseNum: {
        type: Number,
        required: true
    },

    action: {
        type: String,
        required: true
    },

    start: {
        type: Number,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    end: {
        type: Number,
        required: true,
        index: true
    },
    role: {
        type: String
    },
    roles: {
        type: Array
    },
    untimed: {
        type: Boolean,
        default: false,
        index: true
    },
    failCount:{
        type: Number,
        default: 0
    }
}, {
    autoIndex: true,
    minimize: false
});
ModerationSchema.index({end: 1, untimed: 1});
ModerationSchema.index({guild: 1, user: 1});
ModerationSchema.index({guild: 1, user: 1, action: 1});
export interface IModeration{
    mid: string;
    user: string;
    caseNum: number;
    action: string;
    start: number;
    duration: number;
    end: number;
    role?: string;
    roles?: Array<string>;
    failCount?: number;
    untimed: boolean;
    guild: string;
}

export interface IModerationDoc extends IModeration, Document{}
export interface IModerationModel extends Model<IModerationDoc>{}
export default model<IModerationDoc>("moderation", ModerationSchema);