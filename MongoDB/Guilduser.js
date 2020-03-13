/*stores an object, guild, and user

*/


const {Schema, model} = require('mongoose');

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

exports.model = new model("guilduserdata", guilduserdata);