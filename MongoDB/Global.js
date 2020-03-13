const {Schema, model} = require('mongoose');

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

    data: {
        type: Object,
        default: {}
    }
},{
    minimize: false,
    strict: false
});

exports.model = new model("global", globalconf)