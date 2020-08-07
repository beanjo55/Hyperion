
/* eslint-disable @typescript-eslint/no-empty-interface */
/*stores an object, guild, and user

*/


import {Schema, model, Document, Model} from "mongoose";

const guilduserdata = new Schema({

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

    data: {
        type: Object
    },

    highlights: {
        type: Array,
        default: []
    },
    level: {
        type: Number,
        default: 0
    },
    exp: {
        type: Number,
        default: 0
    }
},{
    autoIndex: true,
    strict: false
});

export interface IGuildUser{
    guild: string;
    user: string;
    highlights: Array<string>;
    exp: number;
    level: number;
}
export interface IGuildUserDoc extends IGuildUser, Document{}
export interface IGuildUserModel extends Model<IGuildUserDoc>{}

export default model<IGuildUserDoc>("guilduserdata", guilduserdata);