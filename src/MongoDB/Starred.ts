import {Schema, model} from "mongoose";

const starred = new Schema({
    guild: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true,
        unique: true
    },

    starpost: {
        type: String,
        required: true
    }
},{
    minimize: false,
    autoIndex: true  
});

export default  model("Starred", starred);