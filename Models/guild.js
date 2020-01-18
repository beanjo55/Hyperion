const { Schema, model } = require('mongoose');

const guildSchema = new Schema( {

    guildID: { type: String, required: true, index: true },
    prefix: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
    savedAt: { type: Date },
    updatedAt: { type: Date },

    ignoredUsers: { type: Array, default: [] },
    ignoredRoles: { type: Array, default: [] }, 
    ignoredChannels: { type: Array, default: [] },

    modLogChannel: { type: String, default: null },
    modLogStatus: { type: Boolean, default: false },
    cases: { type: Array, default: [] },
    protectedRoles: { type: Array, default: [] },
    mutes: { type: Array, default: [] },
    mutedRole: { type: String, default: null },

    modOnly: { type: Boolean, default: false },
    modRoles: { type: Array, default: [], required: false },
    modUsers: { type: Array, default: [], required: false },
    locked: { type: Array, default: [] },

    autoresponder: { type: Array, default: [] },
    disabledCommands: { type: Array, default: [] },




    }, {
    autoIndex: true,
    minimize: false,
} );
const guild = model('Guild', guildSchema);
exports.Guild = guild;