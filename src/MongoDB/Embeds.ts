/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import {Schema, Document, Model, model} from "mongoose";
import {CustomEmbed} from "../Modules/Embeds/Embeds";

const embedSchema = new Schema({
    guild: {
        type: String,
        required: true,
        unique: true
    },

    limit: {
        type: Number,
        default: 15
    },
    embeds: {
        type: Map,
        of: Object,
        default: new Map()
    }
},{
    minimize: false,
    autoIndex: true
});

export interface IEmbed{
    guild: string;
    limit: number;
    embeds: Map<string, CustomEmbed>;
}

export interface IEmbedDoc extends IEmbed, Document{}
export interface IEmbedModel extends Model<IEmbedDoc>{}
export default model<IEmbedDoc>("Embeds", embedSchema);