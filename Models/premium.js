const { Schema, model } = require('mongoose');

const premiumschema = new Schema({

    guildId: {type: String, required: true, index: true},
    activated: {type: Boolean, required: true},
    activatorID: {type: String, required: true}



}, {
    autoIndex: true,
    minimize: false,
});
const premiumModel = model('Premium', premiumschema);
exports.premiumModel = premiumModel;