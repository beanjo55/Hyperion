const { Schema, model } = require('mongoose');

const premiumschema = new Schema({

    guildId: { type: String, required: true, index: true, default: "" },
    activated: { type: Boolean, required: true, default: false },
    activatorID: { type: String, default: "" }



}, {
    autoIndex: true,
    minimize: false,
});
const premiumModel = model('Premium', premiumschema);
exports.premiumModel = premiumModel;