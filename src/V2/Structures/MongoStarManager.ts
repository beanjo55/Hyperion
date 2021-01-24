import { Document, Model } from "mongoose";
import hyperion, { StarType } from "../../main";


export default class MongoModerationManager {
    Hyperion: hyperion;
    constructor(newHype: hyperion){this.Hyperion = newHype;}

    raw(): Model<StarType & Document> {
        return this.Hyperion.manager.stars("dummy").raw() as Model<StarType & Document>;
    }
}