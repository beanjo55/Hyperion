/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDBManager from "../../Structures/BaseDBManager";
import hyperion, {roles, GuildType, moderationType, modLogType, noteType, UserType, EmbedType, GuilduserType, StarType} from "../../main";
import {Schema, model, Model, Document} from "mongoose";
import {inspect} from "util";

type TagType = unknown;

// eslint-disable-next-line @typescript-eslint/ban-types
const guildBase: {[key: string]: {type: String | Object | Number | Boolean | Array<never>; unique?: boolean; index?: boolean; default?: unknown, immutable?: boolean}} = {
    guild: {type: String, unique: true, index: true, immutable: true},
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

export default class MongoManager extends BaseDBManager{
    guildSchema!: Schema;
    guild!: Model<GuildType & Document>;

    userSchema = new Schema(userData, {autoIndex: true});
    user!: Model<UserType & Document>;

    guilduserSchema = new Schema(guildUserData, {autoIndex: true});
    guilduser!: Model<GuilduserType & Document>;

    starSchema = new Schema(starData, {autoIndex: true});
    stars!: Model<StarType & Document>;

    modlogSchema = new Schema(modlogData, {autoIndex: true});
    modlogs!: Model<modLogType & Document>;

    moderationsSchema = new Schema(moderationsData, {autoIndex: true});
    moderations!: Model<moderationType & Document>;

    tagSchema = new Schema(tagsData, {autoIndex: true});
    tags!: Model<TagType & Document>;

    embedsSchema = new Schema(embedsData, {autoIndex: true});
    embeds!: Model<EmbedType & Document>;

    notesSchema = new Schema(noteData, {autoIndex: true});
    notes!: Model<noteType & Document>;
    constructor(Hyperion: hyperion, path: string){
        super({
            db: "mongo",
            priority: 0
        }, Hyperion, path);
    }

    onLoad(){
        this._generateModels();
    }

    onUnload(){
        return;
    }

    _generateModels(){
        this.guildSchema = new Schema(guildBase, {autoIndex: true, minimize: false});
        this.guild = model<GuildType & Document>("guild", this.guildSchema);
        this.user = model<UserType & Document>("user", this.userSchema);
        this.guilduser = model<GuilduserType & Document>("guilduserdatas", this.guilduserSchema);
        this.starSchema.index({guild: 1, user: 1, starPost: 1, deleted: 1});
        this.starSchema.index({guild: 1, channel: 1, starPost: 1, deleted: 1});
        this.stars = model<StarType & Document>("starreds", this.starSchema);
        this.modlogSchema.index({guild: 1, user: 1});
        this.modlogSchema.index({guild: 1, mod: 1});
        this.modlogSchema.index({guild: 1, caseNumber: 1});
        this.modlogSchema.index({guild: 1, user: 1, action: 1});
        this.modlogSchema.index({guild: 1, user: 1, autoEnd: 1});
        this.modlogs = model<modLogType & Document>("modlog", this.modlogSchema);
        this.moderationsSchema.index({guild: 1, user: 1});
        this.moderationsSchema.index({guild: 1, user: 1, action: 1});
        this.moderationsSchema.index({end: 1, untimed: 1});
        this.moderations = model<moderationType & Document>("moderations", this.moderationsSchema);
        this.tags = model<TagType & Document>("tags", this.tagSchema);
        this.embeds = model<EmbedType & Document>("embeds", this.embedsSchema);
        this.notes = model<noteType & Document>("notes", this.notesSchema);
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
        try{
            //@ts-ignore
            const created = await this[role].findOneAndUpdate(query, this.clean<T>(data), {upsert: true, new: true, lean: true}).exec();
            return created as unknown as T;
        }catch(err){
            if(err.message.includes("E11000")){
                return await this.get<T>(role, pKey);
            }
            return query as unknown as T;
        }
        
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
            (data as Partial<GuildType>).updatedAt = Date.now();
        }
        try{
            // @ts-ignore
            return await this[role].findOneAndUpdate(query as any, this.clean<T>(data as any), {new: true, upsert: true, lean: true}).exec();
        }catch(err){
            if(err.message.includes("E11000")){
                return await this.get<T>(role, pKey);
            }
            this.Hyperion.logger.error("Hyperion", `DB Update Failed, err: ${err.message}`);
            this.Hyperion.logger.error("Hyperion", `DB Update Failed, payload: ${inspect(data)}`);
            this.Hyperion.sentry.captureException(err);
            return query as unknown as T;
        }
    }

    raw<T>(role: roles){
        return this[role] as unknown as  Model<Document & T>;
    }

    merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }

    async getGuild(id: string): Promise<GuildType> {
        const cached = await this.Hyperion.redis.get(`ConfigCache:${id}`);
        if(cached){
            this.Hyperion.redis.expire(`ConfigCache:${id}`, 1800);
            return JSON.parse(cached) as GuildType;
        }
        const adata = await this.guild.findOne({guild: id}).lean<GuildType>().exec();
        if(!adata){
            try {
                const data = await this.guild.create({guild: id});
                await this.Hyperion.redis.set(`ConfigCache:${id}`, JSON.stringify(data), "EX", 1800);
                return data;
            }catch(err){
                if(err.message.includes("E11000")){
                    const data2 = await this.guild.findOne({guild: id}).lean<GuildType>().exec();
                    if(!data2){throw new Error("Data null after dupe key error fallback");}
                    return data2;
                }
                throw err;
            }
        }
        await this.Hyperion.redis.set(`ConfigCache:${id}`, JSON.stringify(adata), "EX", 1800);
        return adata;
    }

    async updateGuild(id: string, data: Partial<GuildType>): Promise<GuildType> {
        const oldData = await this.getGuild(id);
        const update = this.clean<GuildType>(this.merge<GuildType>(oldData, data));
        try {
            const result = await this.guild.findOneAndUpdate({guild: id}, update, {new: true, upsert: true, lean: true}).exec();
            await this.Hyperion.redis.set(`ConfigCache:${id}`, JSON.stringify(result), "EX", 1800);
            return result;
        }catch(err){
            if(err.message.includes("E11000")){
                const result = await this.guild.findOneAndUpdate({guild: id}, update, {new: true, upsert: true, lean: true}).exec();
                await this.Hyperion.redis.set(`ConfigCache:${id}`, JSON.stringify(result), "EX", 1800);
                return result;
            }
            throw(err);
        }
    }

    rawGuild(): Model<Document & GuildType> {
        return this.guild;
    }

    async getUser(id: string): Promise<UserType> {
        const data = await this.user.findOne({user: id}).lean<UserType>().exec();
        if(!data){
            try {
                const created = await this.user.create({user: id});
                return created;
            }catch(err){
                if(err.message.includes("E11000")){
                    const data2 = await this.user.findOne({user: id}).lean<UserType>().exec();
                    if(!data2){throw new Error("Data null after dupe key error fallback");}
                    return data2;
                }
                throw err;
            }
        }
        return data;
    }

    async updateUser(id: string, data: Partial<UserType>): Promise<UserType> {
        data.user = id;
        return await this.user.findOneAndUpdate({user: id}, data, {new: true, lean: true, upsert: true});
    }

    rawUser(): Model<UserType & Document> {
        return this.user;
    }

    async getEmbed(id: string): Promise<EmbedType> {
        const data = await this.embeds.findOne({guild: id}).lean<EmbedType>().exec();
        if(!data){
            try {
                const created = await this.embeds.create({guild: id});
                return created;
            }catch(err){
                if(err.message.includes("E11000")){
                    const data2 = await this.embeds.findOne({guild: id}).lean<EmbedType>().exec();
                    if(!data2){throw new Error("Data null after dupe key error fallback");}
                    return data2;
                }
                throw err;
            }
        }
        return data;
    }

    async updateEmbed(id: string, data: Partial<EmbedType>): Promise<EmbedType> {
        data.guild = id;
        return await this.embeds.findOneAndUpdate({guild: id}, data, {upsert: true, new: true, lean: true});
    }

    rawEmbed(): Model<EmbedType & Document> {
        return this.embeds;
    }

    async getGuilduser(guild: string, user: string): Promise<GuilduserType> {
        const data = await this.guilduser.findOne({user, guild}).lean<GuilduserType>().exec();
        if(!data){
            try {
                const created = await this.guilduser.create({user, guild});
                return created;
            }catch(err){
                if(err.message.includes("E11000")){
                    const data2 = await this.guilduser.findOne({user, guild}).lean<GuilduserType>().exec();
                    if(!data2){throw new Error("Data null after dupe key error fallback");}
                    return data2;
                }
                throw err;
            }
        }
        return data;
    }

    async updateGuilduser(guild: string, user: string, data: Partial<GuilduserType>): Promise<GuilduserType> {
        data.guild = guild;
        data.user = user;
        return await this.guilduser.findOneAndUpdate({guild, user}, data, {new: true, upsert: true, lean: true});
    }

    rawGuildUser(): Model<GuilduserType & Document> {
        return this.guilduser;
    }


    async getStarByMessage(guild: string, id: string): Promise<StarType | null> {
        return await this.stars.findOne({guild, message: id}).lean<StarType>().exec();
    }

    async getStarByStarpost(guild: string, id: string): Promise<StarType | null> {
        return await this.stars.findOne({guild, starPost: id}).lean<StarType>().exec();
    }

    async updateStar(guild: string, message: string, data: Partial<StarType>): Promise<StarType> {
        return (await this.stars.findOneAndUpdate({guild, message}, data, {new: true, lean: true}))!;
    }

    async deleteStar(guild: string, message: string): Promise<void> {
        await this.stars.deleteOne({guild, message}).exec();
    }

    rawStar(): Model<StarType & Document> {
        return this.stars;
    }
    async createStar(data: Partial<StarType>): Promise<StarType> {
        return await this.stars.create(data);
    }

    async createModlog(data: Partial<modLogType>): Promise<modLogType> {
        const result = await this.modlogs.create(data);
        return result;
    }

    async createModeration(data: Partial<moderationType>): Promise<moderationType> {
        return this.clean<moderationType>(await this.moderations.create(data));
    }

    async createNote(data: Partial<noteType>): Promise<noteType> {
        return await this.notes.create(data);
    }

    async getModlog(id: string): Promise<modLogType | null> {
        return await this.modlogs.findOne({mid: id}).lean<modLogType>().exec();
    }

    async getModlogs(guild: string, user: string): Promise<Array<modLogType>> {
        return await this.modlogs.find({guild, user}).lean<modLogType>().exec();
    }

    async getModeration(id: string): Promise<moderationType | null> {
        return await this.moderations.findOne({mid: id}).lean<moderationType>().exec();
    }

    async getNotes(guild: string, user: string): Promise<Array<noteType>> {
        return await this.notes.find({guild, user}).lean<noteType>().exec();
    }

    async getNote(guild: string, user: string, id: number): Promise<noteType | null> {
        return await this.notes.findOne({guild, user, id}).lean<noteType>().exec();
    }

    async updateModlog(id: string, data: Partial<modLogType>): Promise<modLogType> {
        return (await this.modlogs.findOneAndUpdate({mid: id}, data, {new: true, lean: true}))!;
    }

    async updateModeration(id: string, data: Partial<moderationType>): Promise<moderationType> {
        return (await this.moderations.findOneAndUpdate({mid: id}, data, {new: true, lean: true}))!;
    }

    async updateNote(guild: string, user: string, id: number, data: Partial<noteType>): Promise<noteType> {
        return (await this.notes.findOneAndUpdate({guild, user, id}, data, {new: true, lean: true}))!;
    }

    rawNote(): Model<noteType & Document> {
        return this.notes;
    }

    rawModeration(): Model<moderationType & Document> {
        return this.moderations;
    }

    rawModlog(): Model<modLogType & Document> {
        return this.modlogs;
    }


}

const userData = {
    user: {type: String, unique: true, required: true, immutable: true},
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
    user: {type: String, required: true, immutable: true},
    guild: {type: String, required: true, immutable: true},
    highlights: {type: Array, default: []},
    level: {type: Number, default: 0},
    exp: {type: Number, default: 0}
};

const embedsData = {
    guild: {type: String, unique: true, required: true, immutable: true},
    embeds: {type: Object},
    limit: {type: Number}
};

const tagsData = {
    guild: {type: String, unique: true, required: true, immutable: true},
    tags: {type: Object}
};

/* new data model for v3 starbaord
const starData = {
    guild: {type: String, required: true, unique: true},
    starMessageMap: {type: Object}
};
*/

const starData = {
    guild: {type: String, required: true, immutable: true},
    channel: {type: String, required: true, immutable: true},
    message: {type: String, required: true, immutable: true, index: true},
    count: {type: Number, default: 1},

    starChannel: {type: String},
    starPost: {type: String, index: true},

    origStars: {type: Array},

    deleted: {type: Boolean},
    locked: {type: Boolean},

    user: {type: String, required: true, immutable: true}
};

const modlogData = {
    mid: {type: String, unique: true, required: true, immutable: true},
    user: {type: String, required: true, immutable: true},
    guild: {type: String, required: true, immutable: true},
    caseNumber: {type: Number, required: true, immutable: true},
    moderator: {type: String, required: true, immutable: true}, //v2 name, v3 name is mod
    moderationType: {type: String, required: true, immutable: true}, //v2 name, v3 name is action
    hidden: {type: Boolean},
    reason: {type: String},
    duration: {type: Number}, //v2 name, v3 name is duration
    autoEnd: {type: Boolean},
    logChannel: {type: String},
    logPost: {type: String},
    timeGiven: {type: Number, required: true, immutable: true}, //v2 name, v3 name is time
    name: {type: String, required: false}, //v2, required should be true
    expired: {type: Boolean, default: false}, //v2
    endTime: {type: Number}, //v2
    stringLength: {type: String}, //v2
    auto: {type: Boolean}, //v2
    role: {type: String}, //v2
    removedRoles: {type: Array} //v2
};

const moderationsData = {
    mid: {type: String, unique: true, required: true, immutable: true},
    guild: {type: String, required: true, immutable: true},
    user: {type: String, required: true, immutable: true},
    action: {type: String, required: true, immutable: true},
    duration: {type: Number, required: true},
    start: {type: Number, immutable: true, default: Date.now()},
    end: {type: Number, index: true},
    roles: {type: Array},
    channels: {type: Array},
    failCount: {type: Number, default: 0},
    caseNum: {type: Number, required: true, immutable: true}, //v2
    untimed: {type: Boolean, required: true} //v2
};

const noteData = {
    guild: {type: String, required: true, immutable: true},
    user: {type: String, required: true, immutable: true},
    mod: {type: String, required: true},
    content: {type: String, required: true},
    time: {type: Number, required: true},
    id: {type: Number, required: true}
};
