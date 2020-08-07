/* eslint-disable @typescript-eslint/no-empty-interface */
import {Schema, model, Model, Document} from "mongoose";
import { AckInterface } from "../types";

const userinfo = new Schema({

    user: {
        type: String,
        required: true,
        unique: true
    },

    level: {
        type: Number,
        default: 0
    },

    exp: {
        type: Number,
        default: 0
    },

    money: {
        type: Number,
        default: 0
    },

    rep: {
        type: Number,
        default: 0
    },

    repGiven: {
        type: Number,
        default: 0
    },

    lastRepTime: {
        type: Number,
        default: 0
    },

    lastDailyTime: {
        type: Number,
        default: 0
    },

    lastSallyGame: {
        type: Number,
        default: 0
    },

    socialPings: {
        type: Boolean,
        default: true
    },

    color: {
        type: String
    },

    friends: {
        type: Array,
        default: []
    },

    partner: {
        type: String
    },

    bio: {
        type: String,
        default: ""
    },

    data: {
        type: Object,
        default: {}
    },


    
    /*
    {
        contrib
        friend
        staff
        support
        admin
        developer
        owner
        custom
    }
    */

    acks: {
        type: Object,
        default: {}
    }
},{
    minimize: false,
    autoIndex: true
});

export interface IUser{
    user: string;
    level: number;
    exp: number;
    money: number;
    rep: number;
    repGiven: number;
    lastRepTime: number;
    lastDailyTime: number;
    lastSallyGame: number;
    socialPings: boolean;
    color?: string;
    friends: Array<string>;
    partner?: string;
    bio: string;
    data: Record<string, unknown>;
    acks: AckInterface;
}

export interface IUserDoc extends Document, IUser {}
export interface IUserModel extends Model<IUserDoc> {}
export default model<IUserDoc>("user", userinfo);