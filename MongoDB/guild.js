const {Schema, model} = require('mongoose');


const guildconf = new Schema({

    guild: {
        type: String,
        required: true,
        unique: true
    },

    prefix: {
        type: String,
        trim: true,
        default: "%"
    },

    updatedAt: {
        type: Number
    },

    //modules
    modules: {
        type: Object,
        default: {}
    },

    reactionRoles: {
        type: Object,
        default: {}
    },

    tags: {
        type: Object,
        default: {}
    },

    autorole: {
        type: Object,
        default: {}
    },

    ranks: {
        type: Object,
        default: {}
    },

    starboard: {
        type: Object,
        default: {}
    },

    mod: {
        type: Object,
        default: {
            modRoles: [],
            protectedRoles: [],
            protectedUsers: [],
            requireReason: false,
            requireMuteTime: false,
            deleteOnBan: true,
            deleteCommand: false,
            deleteResponseAfter: -1,
            modLogChannel: ""
        }
    },

    //commands
    commands: {
        type: Object,
        default: {}
    },

    ignoredChannels: {
        type: Array,
        default: []
    },

    ignoredRoles: {
        type: Array,
        default: []
    },

    ignoredUsers: {
        type: Array,
        default: []
    },

    //misc
    cantRunMessage: {
        type: Boolean,
        default: false
    },

    botMissingPermsMessages: {
        type: Boolean,
        default: false
    }


},{
    minimize: false,
    autoIndex: true
});

exports.model = new model("guild", guildconf);