/*stores an object, guild, and user

*/


import {Schema, model} from "mongoose";

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
    }
},{
    autoIndex: true,
    strict: false
});

export default model("guilduserdata", guilduserdata);