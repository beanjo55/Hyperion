import { Model, Document } from "mongoose";
import { inspect } from "util";
import hyperion, {roles, GuildType, modLogType, moderationType, noteType, GuilduserType, UserType, EmbedType, StarType} from "../main";
import BaseConfigManager from "./BaseConfigManager";

const rolePKey = {
    guild: "guild",
    modlogs: "mid",
    moderations: "mid",
    user: "user",
    embeds: "guild",
    tags: "guild",
    stars: "guild",
    notes: "guild",
    guilduser: "guild"
};



export default class RegionalManager {
    Hyperion: hyperion;
    constructor(Hyperion: hyperion){
        this.Hyperion = Hyperion;
    }

    getPrimaryDb(){
        const entries = [...this.Hyperion.dbManagers.values()];
        const positions = entries.map(e => e.priority);
        return entries[positions.indexOf(Math.max(...positions))];
    }

    async updateToAll<T>(role: roles, id: Array<string>, data: T){
        const exists = await this.getPrimaryDb().exists(role, id);
        if(!exists){
            return await this.createToAll<T>(role, id, data);
        }
        const results =  await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.update<T>(role, id, data)));
        if(results[0].status === "rejected"){
            this.Hyperion.logger.error("Hyperion", `Failed to update ${role} config, error: ${results[0].reason}`, "Database Update");
            const err = new Error(results[0].reason);
            this.Hyperion.sentry.captureException(err, {
                tags: {db_role: role},
                extra: {"Primary Key": id.length === 2 ? id.join(":") : id[0]}
            });
            throw err;
        }
        return (results[0] as PromiseFulfilledResult<T>)?.value ?? {} as T;
    }

    async createToAll<T>(role: roles, id: Array<string>, data?: Partial<T>){
        const results = await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.create<T>(role, id, data)));
        if(results[0].status === "rejected"){
            if(results[0].reason.message.startsWith("E11000")){
                return await this.getPrimaryDb().get<T>(role, id);
            }
            this.Hyperion.logger.error("Hyperion", `Failed to create ${role} config, error: ${results[0].reason}`, "Database Create");
            const err = new Error(results[0].reason);
            this.Hyperion.sentry.captureException(err, {
                tags: {db_role: role},
                extra: {"Primary Key": id.length === 2 ? id.join(":") : id[0]}
            });
            throw err;
        }
        return (results[0] as PromiseFulfilledResult<T>)?.value ?? {} as T;
    }

    async deleteToAll(role: roles, id: Array<string>){
        return await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.delete(role, id)));
    }

    doOps<T>(role: roles, id: string, user?: string){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blank: any = {};
        blank[rolePKey[role]] = id;
        const pKey = [id];
        if(user){
            pKey.push(user);
            blank.user = user;
        }
        
        return {
            exists: async () => {
                return await this.getPrimaryDb().exists(role, pKey);
            },
            create: async (data?: Partial<T>): Promise<T> => {
                /*
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    const toRetrun = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                    cache = null;
                    return toRetrun;
                }*/
                const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey, data)));
                /*
                if(role === "guild"){
                    await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                }*/
                return result;
            },
            delete: async () => {return await this.deleteToAll(role, pKey);},
            get: async () => {
                /*
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    const toRetrun = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                    cache = null;
                    return toRetrun;
                }*/
                const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                if(role === "guild" && (result as unknown as GuildType).guild !== id){
                    console.log("id mismatch");
                }
                /*
                if(role === "guild"){
                    await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                }*/
                return result;
            },
            update: async (data: Partial<T>) => {
                let oldDataFetch = await this.getPrimaryDb().get<T>(role, pKey);
                if(!oldDataFetch){
                    oldDataFetch = await this.getPrimaryDb().create(role, pKey);
                }
                let oldData;
                try{
                    oldData = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(oldDataFetch);
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", "Old Data Update Fetch Format failed");
                    this.Hyperion.logger.error("Hyperion", inspect(oldDataFetch));
                    throw(err);
                }
                data = this.merge<T>((oldData as T), data);
                data = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.save(data);
                const updateResult = await this.updateToAll(role, pKey, data);
                try{
                    const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(updateResult, true);
                    /*
                    if(role === "guild"){
                        await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    }*/
                    return result;
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", "Post Update Format failed");
                    this.Hyperion.logger.error("Hyperion", inspect(updateResult));
                    throw(err);
                }
            },
            getOrCreate: async () => {
                /*
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    const toRetrun = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                    cache = null;
                    return toRetrun;
                }*/
                let result = await this.getPrimaryDb().get<T>(role, pKey);
                if(!result){
                    try{
                        const createResult = (await this.createToAll<T>(role, pKey));
                        result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(createResult);
                    }catch(err){
                        this.Hyperion.logger.error("Hyperion", "Formatting failed after create path of getOrCreate");
                        this.Hyperion.logger.error("Hyperion", inspect(result));
                    }
                    /*
                    if(role === "guild"){
                        await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    }*/
                    return result;
                }else{
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
                }
            },
            raw: () => {
                return this.getPrimaryDb().raw<T>(role);
            }
        };
    }

    guild(){
        const get = async function(this: RegionalManager, id: string): Promise<GuildType> {
            const result = await this.getPrimaryDb().getGuild(id);
            return (this.Hyperion.configManagers.get("guild") as BaseConfigManager<GuildType>).format(result);
        };
        const update = async function(this: RegionalManager, id: string, data: Partial<GuildType>): Promise<GuildType> {
            const result = await this.getPrimaryDb().updateGuild(id, data);
            return (this.Hyperion.configManagers.get("guild") as BaseConfigManager<GuildType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<GuildType & Document> {
            return this.getPrimaryDb().rawGuild() as Model<GuildType & Document>;
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this)
        };
    }

    user(){
        const get = async function(this: RegionalManager, id: string): Promise<UserType> {
            const result = await this.getPrimaryDb().getUser(id);
            return (this.Hyperion.configManagers.get("user") as BaseConfigManager<UserType>).format(result);
        };
        const update = async function(this: RegionalManager, id: string, data: Partial<UserType>): Promise<UserType> {
            const result = await this.getPrimaryDb().updateUser(id, data);
            return (this.Hyperion.configManagers.get("user") as BaseConfigManager<UserType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<UserType & Document> {
            return this.getPrimaryDb().rawUser() as Model<UserType & Document>;
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this)
        };
    }

    guilduser(){
        const get = async function(this: RegionalManager, guild: string, user: string): Promise<GuilduserType> {
            const result = await this.getPrimaryDb().getGuilduser(guild, user);
            return (this.Hyperion.configManagers.get("guilduser") as BaseConfigManager<GuilduserType>).format(result);
        };
        const update = async function(this: RegionalManager, guild: string, user: string, data: Partial<GuilduserType>): Promise<GuilduserType> {
            const result = await this.getPrimaryDb().updateGuilduser(guild, user, data);
            return (this.Hyperion.configManagers.get("guilduser") as BaseConfigManager<GuilduserType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<GuilduserType & Document> {
            return this.getPrimaryDb().rawGuildUser() as Model<GuilduserType & Document>;
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this)
        };
    }

    embeds(){
        const get = async function(this: RegionalManager, id: string): Promise<EmbedType> {
            const result = await this.getPrimaryDb().getEmbed(id);
            return (this.Hyperion.configManagers.get("embed") as BaseConfigManager<EmbedType>).format(result);
        };
        const update = async function(this: RegionalManager, id: string, data: Partial<EmbedType>): Promise<EmbedType> {
            const result = await this.getPrimaryDb().updateEmbed(id, data);
            return (this.Hyperion.configManagers.get("embed") as BaseConfigManager<EmbedType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<EmbedType & Document> {
            return this.getPrimaryDb().rawEmbed() as Model<EmbedType & Document>;
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this)
        };
    }

    tags<T>(id: string){
        return this.doOps<T>("tags", id);
    }

    moderations(){
        const get = async function(this: RegionalManager, id: string): Promise<moderationType | null> {
            const result = await this.getPrimaryDb().getModeration(id);
            if(!result){return null;}
            return (this.Hyperion.configManagers.get("moderations") as BaseConfigManager<moderationType>).format(result);
        };
        const update = async function(this: RegionalManager, id: string, data: Partial<moderationType>): Promise<moderationType> {
            const result = await this.getPrimaryDb().updateModeration(id, data);
            return (this.Hyperion.configManagers.get("moderations") as BaseConfigManager<moderationType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<moderationType & Document> {
            return this.getPrimaryDb().rawModeration() as Model<moderationType & Document>;
        };
        const create = async function(this: RegionalManager, data: Partial<moderationType>): Promise<moderationType> {
            const result =  await this.getPrimaryDb().createModeration(data);
            return (this.Hyperion.configManagers.get("moderations") as BaseConfigManager<moderationType>).format(result);
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this),
            create: create.bind(this)
        };
    }

    modlogs(){
        const get = async function(this: RegionalManager, id: string): Promise<modLogType | null> {
            const result = await this.getPrimaryDb().getModlog(id);
            if(!result){return null;}
            return (this.Hyperion.configManagers.get("modlogs") as BaseConfigManager<modLogType>).format(result);
        };
        const update = async function(this: RegionalManager, id: string, data: Partial<modLogType>): Promise<modLogType> {
            const result = await this.getPrimaryDb().updateModlog(id, data);
            return (this.Hyperion.configManagers.get("modlogs") as BaseConfigManager<modLogType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<modLogType & Document> {
            return this.getPrimaryDb().rawModlog() as Model<modLogType & Document>;
        };
        const create = async function(this: RegionalManager, data: Partial<modLogType>): Promise<modLogType> {
            const result =  await this.getPrimaryDb().createModlog(data);
            return (this.Hyperion.configManagers.get("modlogs") as BaseConfigManager<modLogType>).format(result);
        };
        return {
            get: get.bind(this),
            update: update.bind(this),
            raw: raw.bind(this),
            create: create.bind(this)
        };
    }

    notes(){
        const getOne = async function(this: RegionalManager, guild: string, user: string, id: number): Promise<noteType | null> {
            const result = await this.getPrimaryDb().getNote(guild, user, id);
            if(!result){return null;}
            return (this.Hyperion.configManagers.get("notes") as BaseConfigManager<noteType>).format(result);
        };
        const getAll = async function(this: RegionalManager, guild: string, user: string): Promise<Array<noteType> | null> {
            const result = await this.getPrimaryDb().getNotes(guild, user);
            if(!result){return null;}
            return result.map(n => (this.Hyperion.configManagers.get("notes") as BaseConfigManager<noteType>).format(n));
        };
        const update = async function(this: RegionalManager, guild: string, user: string, id: number, data: Partial<noteType>): Promise<noteType> {
            const result = await this.getPrimaryDb().updateNote(guild, user, id, data);
            return (this.Hyperion.configManagers.get("notes") as BaseConfigManager<noteType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<noteType & Document> {
            return this.getPrimaryDb().rawNote() as Model<noteType & Document>;
        };
        const create = async function(this: RegionalManager, data: Partial<noteType>): Promise<noteType> {
            const result =  await this.getPrimaryDb().createNote(data);
            return (this.Hyperion.configManagers.get("notes") as BaseConfigManager<noteType>).format(result);
        };
        return {
            getOne: getOne.bind(this),
            getAll: getAll.bind(this),
            update: update.bind(this),
            raw: raw.bind(this),
            create: create.bind(this)
        };
    }

    stars(){
        const getByMessage = async function(this: RegionalManager, guild: string, id: string): Promise<StarType | null> {
            const result = await this.getPrimaryDb().getStarByMessage(guild, id);
            if(!result){return null;}
            return (this.Hyperion.configManagers.get("stars") as BaseConfigManager<StarType>).format(result);
        };
        const getStarByStarpost = async function(this: RegionalManager, guild: string, id: string): Promise<StarType | null> {
            const result = await this.getPrimaryDb().getStarByStarpost(guild, id);
            if(!result){return null;}
            return (this.Hyperion.configManagers.get("stars") as BaseConfigManager<StarType>).format(result);
        };
        const update = async function(this: RegionalManager, guild: string, message: string, data: Partial<StarType>): Promise<StarType> {
            const result = await this.getPrimaryDb().updateStar(guild, message, data);
            return (this.Hyperion.configManagers.get("stars") as BaseConfigManager<StarType>).format(result);
        };
        const raw = function(this: RegionalManager): Model<StarType & Document> {
            return this.getPrimaryDb().rawStar() as Model<StarType & Document>;
        };
        const create = async function(this: RegionalManager, data: Partial<StarType>): Promise<StarType> {
            const result =  await this.getPrimaryDb().createStar(data);
            return (this.Hyperion.configManagers.get("stars") as BaseConfigManager<StarType>).format(result);
        };
        const del = async function(this: RegionalManager, guild: string, message: string): Promise<void> {
            await this.getPrimaryDb().deleteStar(guild, message);
        };
        return {
            getByMessage: getByMessage.bind(this),
            getByStarpost: getStarByStarpost.bind(this),
            update: update.bind(this),
            raw: raw.bind(this),
            create: create.bind(this),
            delete: del.bind(this)
        };
    }

    merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }
}