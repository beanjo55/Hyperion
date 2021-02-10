import { Document, Model } from "mongoose";
import hyperion, { EmbedType } from "../../main";


export default class MongoEmbedManager {
    Hyperion: hyperion;
    constructor(newHype: hyperion){this.Hyperion = newHype;}

    raw(): Model<EmbedType & Document> {
        return this.Hyperion.manager.embeds().raw() as Model<EmbedType & Document>;
    }
}