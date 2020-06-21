/* eslint-disable @typescript-eslint/interface-name-prefix */
import {Schema, model, Model, Document} from "mongoose";
import * as Types from "../types";
import * as confs from "../Core/DataManagers/MongoGuildManager";

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
        default: new confs.RRConfig({})
    },

    tags: {
        type: Object,
        default: new confs.TagConfig({})
    },

    autorole: {
        type: Object,
        default: new confs.AutoroleConfig({})
    },

    ranks: {
        type: Object,
        default: new confs.RankConfig({})
    },

    starboard: {
        type: Object,
        default: new confs.StarboardConfig({})
    },

    logging: {
        type: Object,
        default: new confs.LoggingConfig({})
    },

    welcome: {
        type: Object,
        default: new confs.WelcomeConfig({})
    },

    mod: {
        type: Object,
        default: new confs.ModConfig({})
    },

    //commands
    commands: {
        type: Object,
        default: {}
    },

    social: {
        type: Object,
        default: new confs.SocialConfig({})
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
    }


},{
    minimize: false,
    autoIndex: true
});

export interface IGuild{
    guild: string;
    prefix: string;
    updatedAt?: number;
    modules: {[key: string]: Types.ModuleConfig};
    reactionRoles: Types.RRConfig;
    tags: Types.TagConfig;
    autorole: Types.AutoroleConfig;
    ranks: Types.RankConfig;
    starboard: Types.StarboardConfig;
    logging: Types.LoggingConfig;
    welcome: Types.WelcomeConfig;
    mod: Types.ModConfig;
    commands: {[key: string]: Types.CommandConfig};
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    ignoredUsers: Array<string>;
    cantRunMessage: boolean;
    botMissingPermsMessages: boolean;
    embedCommonResponses: boolean;
    social: Types.SocialConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGuildModel extends Model<IGuildDoc>{}
export interface IGuildDoc extends Document, IGuild{}
export default model<IGuildDoc>("guild", guildconf);