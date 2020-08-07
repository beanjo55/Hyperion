import {Schema, model, Document, Model} from "mongoose";

const globalconf = new Schema({

    sallyGameConsts: {
        type: Object,
        default: {}
    },

    gDisabledMods: {
        type: Array,
        default: []
    },

    gDisabledCommands: {
        type: Array,
        default: []
    },

    blacklist: {
        type: Array,
        default: []
    },

    globalCooldown: {
        type: Number,
        default: 1000
    },

    globalDisabledLogEvents: {
        type: Array,
        default: []
    },

    exp: {
        type: Object,
        default: {
            cooldown: 2000,
            coeff: .17,
            offset: 69.3,
            div: 2,
            min: 10,
            max: 20
        }
    },

    data: {
        type: Object,
        default: {}
    }
},{
    minimize: false,
    strict: false
});

export interface IGlobal{
    sallyGameConsts: Record<string, unknown>;
    gDisabledMods: Array<string>;
    gDisabledCommands: Array<string>;
    globalDisabledLogevents: Array<string>;
    globalCooldown: number;
    blacklist: Array<string>,
    exp: {
        cooldown: number;
        coeff: number;
        offset: number;
        div: number;
        min: number;
        max: number
    },
    data: Record<string, unknown>
}

export interface IGlobalDoc extends IGlobal, Document{}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGlobalModel extends Model<IGlobalDoc>{}
export default model<IGlobalDoc>("global", globalconf);