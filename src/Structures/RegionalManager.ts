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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export default class RegionalManager {
    Hyperion: hyperion;
    creating: {[key: string]: 1} = {};
    pendingGuildOpts: {[key: string]: Array<{
        id: string;
        op: "get" | "create" | "getOrCreate" | "update";
        data?: Partial<GuildType>;
        res: (value: GuildType | PromiseLike<GuildType>) => void;
        rej: (reason?: any) => void;
    }>} = {};
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
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                }
                const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey, data)));
                if(role === "guild"){
                    await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                }
                return result;
            },
            delete: async () => {return await this.deleteToAll(role, pKey);},
            get: async () => {
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                }
                const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                if(role === "guild"){
                    await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                }
                return result;
            },
            update: async (data: Partial<T>) => {
                const oldDataFetch = await this.getPrimaryDb().get<T>(role, pKey);
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
                    if(role === "guild"){
                        await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    }
                    return result;
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", "Post Update Format failed");
                    this.Hyperion.logger.error("Hyperion", inspect(updateResult));
                    throw(err);
                }
            },
            getOrCreate: async () => {
                let cache: null | GuildType = null;
                if(role === "guild"){
                    const rawCache = await this.Hyperion.redis.get(`ConfigCache:${id[0]}`);
                    cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
                }
                if(role === "guild" && cache){
                    await this.Hyperion.redis.expire(`ConfigCache:${id[0]}`, 15 * 60);
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(cache as unknown as T);
                }
                let result = await this.getPrimaryDb().get<T>(role, pKey);
                if(!result){
                    try{
                        const createResult = (await this.createToAll<T>(role, pKey));
                        result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(createResult);
                    }catch(err){
                        this.Hyperion.logger.error("Hyperion", "Formatting failed after create path of getOrCreate");
                        this.Hyperion.logger.error("Hyperion", inspect(result));
                    }
                    if(role === "guild"){
                        await this.Hyperion.redis.set(`ConfigCache:${id[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    }
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

    guild(id: string){
        return this.doOps<GuildType>("guild", id);
    }

    user(id: string){
        return this.doOps<UserType>("user", id);
    }

    guilduser(guild: string, user: string){
        return this.doOps<GuilduserType>("guilduser", guild, user);
    }

    embeds(id: string){
        return this.doOps<EmbedType>("embeds", id);
    }

    tags<T>(id: string){
        return this.doOps<T>("tags", id);
    }

    moderations(id: string){
        return this.doOps<moderationType>("moderations", id);
    }

    modlogs(id: string){
        return this.doOps<modLogType>("modlogs", id);
    }

    notes(id: string){
        return this.doOps<noteType>("notes", id);
    }

    stars(id: string){
        return this.doOps<StarType>("stars", id);
    }

    merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }
}