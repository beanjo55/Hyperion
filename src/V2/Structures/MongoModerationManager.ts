import { Document, Model } from "mongoose";
import hyperion, { moderationType } from "../../main";


export default class MongoModerationManager {
    Hyperion: hyperion;
    constructor(newHype: hyperion){this.Hyperion = newHype;}

    raw(): Model<moderationType & Document> {
        return this.Hyperion.manager.moderations().raw() as Model<moderationType & Document>;
    }
}