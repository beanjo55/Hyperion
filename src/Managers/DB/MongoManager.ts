/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDBManager from "../../Structures/BaseDBManager";
import hyperion, {roles} from "../../main";
import {Schema, model, Model, Document} from "mongoose";
import { number } from "mathjs";

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
    lang: {type: String, default: "en"}
};

const rolePKey = {
    guild: "guild",
    modlogs: "mid",
    moderations: "mid",
    user: "user",
    embeds: "guild",
    tags: "guild",
    stars: "guild"
};

export default class MongoManager<
GuildType = never, // gonna give you up
UserType = never, // gonna let you down
GuilduserType = never, // gonna run around and desert you
StarsType = never, // gonna make you cry
ModlogType = never, // gonna say goodbye 
ModerationsType = never, // gonna tell a lie and hurt you
EmbedsType = never,
TagsType = never
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
        this.Hyperion.modules.forEach(mod => {
            if(mod.config){
                guildBase[mod.name] = {type: Object, default: mod.formatConfig({})};
            }
        });
        this.guildSchema = new Schema(guildBase, {autoIndex: true});
        this.guild = model<GuildType & Document>("guild", this.guildSchema);
        this.user = model<UserType & Document>("user", this.userSchema);
        this.guilduser = model<GuilduserType & Document>("guilduser", this.guilduserSchema);
        this.stars = model<StarsType & Document>("stars", this.starSchema);
        this.modlogSchema.index({guild: 1, user: 1});
        this.modlogSchema.index({guild: 1, moderator: 1});
        this.modlogSchema.index({guild: 1, caseNum: 1});
        this.modlogSchema.index({guild: 1, user: 1, moderationType: 1});
        this.modlogSchema.index({guild: 1, user: 1, autoEnd: 1});
        this.modlogs = model<ModlogType & Document>("modlog", this.modlogSchema);
        this.moderationsSchema.index({guild: 1, user: 1});
        this.moderationsSchema.index({guild: 1, user: 1, moderationType: 1});
        this.moderations = model<ModerationsType & Document>("moderations", this.moderationsSchema);
        this.tags = model<TagsType & Document>("tags", this.tagSchema);
        this.embeds = model<EmbedsType & Document>("embeds", this.embedsSchema);
    }

    async create<T>(role: roles, pKey: Array<string>): Promise<T>{
        const data : {[key: string]: string} = {};
        if(role !== "guilduser"){
            data[rolePKey[role]] = pKey[0];
        }else{
            data.guild = pKey[0],
            data.user = pKey[1];
        }
        try{
            const created = await this[role].create(data);
            return created as unknown as T;
        }catch(err){
            throw new Error("Failed to create new " + role + " Primary key: " + pKey);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const created = await this[role].findOne(data as any).lean<T>().exec();
            return created as unknown as T;
        }catch(err){
            throw new Error("Failed to create new " + role + " Primary key: " + pKey);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this[role].updateOne(query as any, data as any).exec();
        return await this.get<T>(role, pKey);
    }

    raw(role: roles){
        return this[role];
    }
}

const userData = {
    user: {type: String, unique: true, required: true},
    rep: {type: Number, default: 0},
    repGiven: {type: Number, default: 0},
    money: {type: Number, default: 0},
    level: {type: Number, default: 0},
    exp: {type: Number, default: 0},
    lastRepTime: {type: number, default: 0},
    lastDailyTime: {type: Number, default: 0},
    bio: {type: String}
};

const guildUserData = {
    user: {type: String, required: true},
    guild: {type: String, required: true},
    highlights: {type: Array, default: []},
    level: {type: number, default: 0},
    exp: {type: Number, default: 0}
};

const embedsData = {
    guild: {type: String, unique: true, required: true},
    embeds: {type: Object}
};

const tagsData = {
    guild: {type: String, unique: true, required: true},
    tags: {type: Object}
};

const starData = {
    guild: {type: String, required: true, unique: true},
    starMessageMap: {type: Object}
};

const modlogData = {
    mid: {type: String, unique: true, required: true},
    user: {type: String, required: true},
    guild: {type: String, required: true},
    caseNum: {type: Number, required: true},
    moderator: {type: String, required: true},
    moderationType: {type: String, required: true},
    hidden: {type: Boolean},
    reason: {type: String},
    expired: {type: Boolean},
    duration: {type: String},
    role: {type: String},
    autoEnd: {type: Boolean},
    logChannel: {type: String},
    logPost: {type: String}
};

const moderationsData = {
    mid: {type: String, unique: true, required: true},
    guild: {type: String, required: true},
    user: {type: String, required: true},
    moderationType: {type: String, required: true},
    duration: {type: Number, required: true},
    start: {type: Number},
    end: {type: Number, index: true},
    role: {type: String},
    roles: {type: Array},
};