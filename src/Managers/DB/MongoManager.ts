/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDBManager from "../../Structures/BaseDBManager";
import hyperion, {roles, GuildType as gt, moderationType as mt, modLogType as mlt, noteType as nt} from "../../main";
import {Schema, model, Model, Document} from "mongoose";
import {inspect} from "util";

// eslint-disable-next-line @typescript-eslint/ban-types
const guildBase: {[key: string]: {type: String | Object | Number | Boolean | Array<never>; unique?: boolean; index?: boolean; default?: unknown}} = {
    guild: {type: String, unique: true, index: true},
    prefix: {type: String},
    updatedAt: {type: Number},
    ignoredChannels: {type: Array},
    ignoredRoles: {type: Array},
    ignoredUsers: {type: Array},
    cantRunMessage: {type: Boolean, default: false},
    embedCommonResponses: {type: Boolean, default: false},
    casualPrefix: {type: Boolean, default: false},
    pro: {type: Boolean, default: false},
    deletedAt: {type: Number},
    deleted: {type: Boolean},
    modules: {type: Object},
    commands: {type: Object},
    dev: {type: Boolean},
    lang: {type: String, default: "en"},
    reactionRoles: {type: Object},
    starboard: {type: Object},
    logging: {type: Object},
    welcome: {type: Object},
    goodbye: {type: Object},
    mod: {type: Object},
    quotes: {type: Object},
    levels: {type: Object},
    vtl: {type: Object},
    suggestions: {type: Object}
};

const rolePKey = {
    guild: "guild",
    modlogs: "mid",
    moderations: "mid",
    user: "user",
    embeds: "guild",
    tags: "guild",
    stars: "guild",
    notes: "guild"
};

export default class MongoManager<
GuildType = gt, // gonna give you up
UserType = never, // gonna let you down
GuilduserType = {guild: string; user: string}, // gonna run around and desert you
StarsType = never, // gonna make you cry
ModlogType = mlt, // gonna say goodbye 
ModerationsType = mt, // gonna tell a lie and hurt you
EmbedsType = never,
TagsType = never,
NotesType = nt
> extends BaseDBManager{
    guildSchema!: Schema;
    guild!: Model<GuildType & Document>;

    userSchema = new Schema(userData, {autoIndex: true});
    user!: Model<UserType & Document>;

    guilduserSchema = new Schema(guildUserData, {autoIndex: true});
    guilduser!: Model<GuilduserType & Document>;

    starSchema = new Schema(starData, {autoIndex: true});
    stars!: Model<StarsType & Document>;

    modlogSchema = new Schema(modlogData, {autoIndex: true});
    modlogs!: Model<ModlogType & Document>;

    moderationsSchema = new Schema(moderationsData, {autoIndex: true});
    moderations!: Model<ModerationsType & Document>;

    tagSchema = new Schema(tagsData, {autoIndex: true});
    tags!: Model<TagsType & Document>;

    embedsSchema = new Schema(embedsData, {autoIndex: true});
    embeds!: Model<EmbedsType & Document>;

    notesSchema = new Schema(noteData, {autoIndex: true});
    notes!: Model<NotesType & Document>;
    constructor(Hyperion: hyperion, path: string){
        super({
            db: "mongo",
            priority: 0
        }, Hyperion, path);
    }

    onLoad(){
        this.generateGuildSchema();
    }

    onUnload(){
        return;
    }

    generateGuildSchema(){
        /*
        this.Hyperion.modules.forEach(mod => {
            if(mod.config){
                guildBase[mod.name] = {type: Object, default: mod.formatConfig({})};
            }
        });*/
        this.guildSchema = new Schema(guildBase, {autoIndex: true, minimize: false});
        this.guild = model<GuildType & Document>("guild", this.guildSchema);
        this.user = model<UserType & Document>("user", this.userSchema);
        this.guilduser = model<GuilduserType & Document>("guilduserdatas", this.guilduserSchema);
        this.stars = model<StarsType & Document>("starreds", this.starSchema);
        this.modlogSchema.index({guild: 1, user: 1});
        this.modlogSchema.index({guild: 1, mod: 1});
        this.modlogSchema.index({guild: 1, caseNumber: 1});
        this.modlogSchema.index({guild: 1, user: 1, action: 1});
        this.modlogSchema.index({guild: 1, user: 1, autoEnd: 1});
        this.modlogs = model<ModlogType & Document>("modlog", this.modlogSchema);
        this.moderationsSchema.index({guild: 1, user: 1});
        this.moderationsSchema.index({guild: 1, user: 1, action: 1});
        this.moderationsSchema.index({end: 1, untimed: 1});
        this.moderations = model<ModerationsType & Document>("moderations", this.moderationsSchema);
        this.tags = model<TagsType & Document>("tags", this.tagSchema);
        this.embeds = model<EmbedsType & Document>("embeds", this.embedsSchema);
        this.notes = model<NotesType & Document>("notes", this.notesSchema);
    }

    clean<T>(data: Partial<T>): T {
        delete (data as any).$__;
        delete (data as any).isNew;
        delete (data as any)["$locals"];
        delete (data as any)["$op"];
        delete (data as any)._doc;
        delete (data as any)._id;
        delete (data as any)["$init"];
        return data as T;
    }

    async create<T>(role: roles, pKey: Array<string>, data?: Partial<T>): Promise<T>{
        if(!data){
            data = {};
            if(role !== "guilduser"){
                (data as any)[rolePKey[role]] = pKey[0];
            }else{
                (data as any).guild = pKey[0],
                (data as any).user = pKey[1];
            }
        }

        const query = {};
        if(role !== "guilduser"){
            (query as any)[rolePKey[role]] = pKey[0];
        }else{
            (query as any).guild = pKey[0],
            (query as any).user = pKey[1];
        }
        
        //@ts-ignore
        const created = await this[role].findOneAndUpdate(query, this.clean<T>(data), {upsert: true, new: true, lean: true}).exec();
        return created as unknown as T;
        
    }

    async get<T>(role: roles, pKey: Array<string>): Promise<T>{
        const data: {[key: string]: string} = {};
        if(role !== "guilduser"){
            data[rolePKey[role]] = pKey[0];
        }else{
            data.guild = pKey[0],
            data.user = pKey[1];
        }
        try{
            // @ts-ignore
            const created = await this[role].findOne(data as any).lean<T>().exec();
            return created as unknown as T;
        }catch(err){
            throw new Error("Failed to update " + role + " Primary key: " + pKey);
        }
    }

    async exists(role: roles, pKey: Array<string>): Promise<boolean> {
        const data: {[key: string]: string} = {};
        if(role !== "guilduser"){
            data[rolePKey[role]] = pKey[0];
        }else{
            data.guild = pKey[0],
            data.user = pKey[1];
        }
        return await this[role].exists(data as any);
    }

    async delete(role: roles, pKey: Array<string>) {
        const data: {[key: string]: string} = {};
        if(role !== "guilduser"){
            data[rolePKey[role]] = pKey[0];
        }else{
            data.guild = pKey[0],
            data.user = pKey[1];
        }
        // @ts-ignore
        return await this[role].deleteOne(data as any).exec();
    }

    async update<T>(role: roles, pKey: Array<string>, data: Partial<T>): Promise<T> {
        const query: {[key: string]: string} = {};
        if(role !== "guilduser"){
            query[rolePKey[role]] = pKey[0];
        }else{
            query.guild = pKey[0],
            query.user = pKey[1];
        }
        if(role === "guild"){
            (data as Partial<gt>).updatedAt = Date.now();
        }
        try{
            // @ts-ignore
            return await this[role].findOneAndUpdate(query as any, this.clean<T>(data as any), {new: true, upsert: true, lean: true}).exec();
        }catch(err){
            this.Hyperion.logger.error("Hyperion", `DB Update Failed, err: ${err.message}`);
            this.Hyperion.logger.error("Hyperion", `DB Update Failed, payload: ${inspect(data)}`);
            this.Hyperion.sentry.captureException(err);
            return {} as unknown as T;
        }
    }

    raw<T>(role: roles){
        return this[role] as unknown as  Model<Document & T>;
    }
}

const userData = {
    user: {type: String, unique: true, required: true},
    rep: {type: Number, default: 0},
    repGiven: {type: Number, default: 0},
    money: {type: Number, default: 0},
    level: {type: Number, default: 0},
    exp: {type: Number, default: 0},
    lastRepTime: {type: Number, default: 0},
    lastDailyTime: {type: Number, default: 0},
    bio: {type: String}
};

const guildUserData = {
    user: {type: String, required: true},
    guild: {type: String, required: true},
    highlights: {type: Array, default: []},
    level: {type: Number, default: 0},
    exp: {type: Number, default: 0}
};

const embedsData = {
    guild: {type: String, unique: true, required: true},
    embeds: {type: Object},
    limit: {type: Number}
};

const tagsData = {
    guild: {type: String, unique: true, required: true},
    tags: {type: Object}
};

/* new data model for v3 starbaord
const starData = {
    guild: {type: String, required: true, unique: true},
    starMessageMap: {type: Object}
};
*/

const starData = {
    guild: {type: String, required: true},
    message: {type: String, required: true, unique: true},
    starpost: {type: String, required: true}
};

const modlogData = {
    mid: {type: String, unique: true, required: true},
    user: {type: String, required: true},
    guild: {type: String, required: true},
    caseNumber: {type: Number, required: true},
    moderator: {type: String, required: true}, //v2 name, v3 name is mod
    moderationType: {type: String, required: true}, //v2 name, v3 name is action
    hidden: {type: Boolean},
    reason: {type: String},
    duration: {type: Number}, //v2 name, v3 name is duration
    autoEnd: {type: Boolean},
    logChannel: {type: String},
    logPost: {type: String},
    timeGiven: {type: Number, required: true}, //v2 name, v3 name is time
    name: {type: String, required: false}, //v2, required should be true
    expired: {type: Boolean, default: false}, //v2
    endTime: {type: Number}, //v2
    stringLength: {type: String}, //v2
    auto: {type: Boolean}, //v2
    role: {type: String}, //v2
    removedRoles: {type: Array} //v2
};

const moderationsData = {
    mid: {type: String, unique: true, required: true},
    guild: {type: String, required: true},
    user: {type: String, required: true},
    action: {type: String, required: true},
    duration: {type: Number, required: true},
    start: {type: Number},
    end: {type: Number, index: true},
    roles: {type: Array},
    channels: {type: Array},
    failCount: {type: Number, default: 0},
    caseNum: {type: Number, required: true}, //v2
    untimed: {type: Boolean, required: true} //v2
};

const noteData = {
    guild: {type: String, required: true},
    user: {type: String, required: true},
    mod: {type: String, required: true},
    content: {type: String, required: true},
    time: {type: Number, required: true},
    id: {type: Number, required: true}
};
