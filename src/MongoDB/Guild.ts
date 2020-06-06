/* eslint-disable @typescript-eslint/interface-name-prefix */
import {Schema, model, Model, Document} from "mongoose";
import * as Types from "../types";


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

    logging: {
        type: Object,
        default: {}
    },

    welcome: {
        type: Object,
        default: {}
    },

    mod: {
        type: Object,
        default: {}
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
    },
    
    embedCommonResponses: {
        type: Boolean,
        default: false
    },
    caseNum: {
        type: String,
        default: "0"
    }


},{
    minimize: false,
    autoIndex: true
});

export interface IGuild{
    guild: string;
    prefix: string;
    updatedAt?: number;
    modules: {[key: string]: {[key: string]: boolean}};
    reactionRoles: {} | Types.RRConfig;
    tags: {} | Types.TagConfig;
    autorole: {} | Types.AutoroleConfig;
    ranks: {} | Types.RankConfig;
    starboard: {} | Types.StarboardConfig;
    logging: {} | Types.LoggingConfig;
    welcome: {}| Types.WelcomeConfig;
    mod: {} | Types.ModConfig;
    commands: {} | Types.CommandConfig;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    ignoredUsers: Array<string>;
    cantRunMessage: boolean;
    botMissingPermsMessages: boolean;
    embedCommonResponses: boolean;
    caseNum: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGuildModel extends Model<IGuildDoc>{}
export interface IGuildDoc extends Document, IGuild{}
export default model<IGuildDoc>("guild", guildconf);