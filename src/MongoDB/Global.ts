import {Schema, model} from "mongoose";

const globalconf = new Schema({

    sallyGameConsts: {
        type: Object,
        default: {}
    },

    gDisabledMods: {
        type: Array,
        default: []
    },

    gDisabledCommands: {
        type: Array,
        default: []
    },

    blacklist: {
        type: Array,
        default: []
    },

    globalCooldown: {
        type: Number,
        default: 1000
    },

    globalDisabledLogEvents: {
        type: Array,
        default: []
    },

    data: {
        type: Object,
        default: {}
    }
},{
    minimize: false,
    strict: false
});

export default model("global", globalconf);