"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Schema, model } = require("mongoose");
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
}, {
    minimize: false,
    autoIndex: true
});
exports.default = new model("Starred", starred);
