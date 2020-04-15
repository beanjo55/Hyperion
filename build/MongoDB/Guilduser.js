"use strict";
/*stores an object, guild, and user

*/
Object.defineProperty(exports, "__esModule", { value: true });
const { Schema, model } = require("mongoose");
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
}, {
    autoIndex: true,
    strict: false
});
exports.default = new model("guilduserdata", guilduserdata);
