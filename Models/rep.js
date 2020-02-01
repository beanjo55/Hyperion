const { Schema, model } = require('mongoose');

const repschema = new Schema({
    userID: {
        type: String,
        required: true,
        index: true
    },

    recieved:{
        type: Number,
        default: 0
    },

    given:{
        type: Number,
        default:0
    },

    lastRepTime:{
        type: Number,
        default: 0
    }
})
const repmodel = model('Rep', repschema);
exports.repModel = repmodel;