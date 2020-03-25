const {Schema, model} = require('mongoose');



const modlog = new Schema({

    guild: {
        type: String,
        required: true,
        index: true
    },

    kind: {
        type: String,
        required: true,
        enum: [
            "ban",
            "banmatch",
            "softban",
            "unban",
            "mute",
            "unmute",
            "warn",
            "automute",
            "note",
            "rolepersist",
            "temprole"
        ]
    },


    //for warnings and notes, if the warn/note as been removed
    removed: {
        type: Boolean,
        default: false
    },

    moderator: {
        type: String,
        required: true
    },

    //case num
    //notes are prefixed with _ and counted separately
    case: {
        type: String,
        index: true,
        required: true
    },

    //reason
    content: {
        type: String
    },


    //time the log was created
    time: {
        type: Number,
        default: Date.now()
    },

    //the length of the modlog, stored as the time after creation
    limit: {
        type: Number
    },

    //array of moderated users. normally just one except for ban match
    user: {
        type: Array,
        required: true
    },

    modName: {
        type: String,
        required: true
    },

    //only for single cases (not ban match)
    userName: {
        type: String
    }

},{
    autoIndex: true,
    minimize: false
});
exports.model = new model("modlog", modlog)