const {Schema, model} = require('mongoose');

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

    repPings: {
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

exports.model = new model("user", userinfo);