/* eslint-disable @typescript-eslint/no-empty-interface */
import {Schema, model, Document, Model} from "mongoose";
const modlog = new Schema({

    guild: {
        type: String,
        required: true,
        index: true
    },

    user: {
        type: String,
        required: true,
        index: true
    },

    moderator: {
        type: String,
        required: true,
        index: true
    },

    mid: {
        type: String,
        required: true, 
        unique: true
    },

    moderationType: {
        type: String,
        required: true
    },

    caseNumber: {
        type: Number,
        required: true
    },

    reason: {
        type: String
    },

    revoked: {
        type: Boolean
    },

    expired: {
        type: Boolean,
        default: false
    },

    timeGiven: {
        type: Number,
        required: true
    },

    duration: {
        type: Number
    },

    endTime: {
        type: Number
    },

    removedRoles: {
        type: Array
    },

    role: {
        type: String
    },

    logPost: {
        type: String
    },

    auto: {
        type: Boolean,
        default: false
    },
    stringLength: {
        type: String
    },
    autoEnd: {
        type: Boolean,
        default: false
    },
    logChannel: {
        type: String
    }
    
    

},{
    autoIndex: true,
    minimize: false,
    strict: false
});
modlog.index({guild: 1, user: 1});
modlog.index({guild: 1, moderator: 1});
modlog.index({guild: 1, caseNumber: 1});
modlog.index({guild: 1, user: 1, moderationType: 1, auto: 1});
modlog.index({guild: 1, user: 1, moderationType: 1});
modlog.index({guild: 1, user: 1, auto: 1});
export interface IModLog{
    guild: string;
    user: string;
    moderator: string;
    mid: string;
    moderationType: string;
    caseNumber: number;
    reason?: string;
    revoked?: boolean;
    expired?: boolean;
    timeGiven: number;
    duration?: number;
    endTime?: number;
    removedRoles?: Array<string>;
    role?: string;
    logPost?: string;
    auto: boolean;
    stringLength?: string;
    autoEnd: boolean;
    logChannel?: string;
}
export interface IModLogDoc extends Document, IModLog{}
export interface IModLogModel extends Model<IModLogDoc>{}
export default model<IModLogDoc>("modlog", modlog);