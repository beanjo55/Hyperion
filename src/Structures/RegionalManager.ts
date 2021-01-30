/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface queueData<T> {
    pKey: Array<string>;
    data?: Partial<T>;
    res: (value: T | PromiseLike<T>) => void;
    rej: (reason?: any) => void;
    op: "get" | "getOrCreate" | "create" | "update";
}


export default class RegionalManager {
    Hyperion: hyperion;
    queues: {
        guild: Array<queueData<GuildType>>;
        user: Array<queueData<UserType>>;
        guilduser: Array<queueData<GuilduserType>>;
        embeds: Array<queueData<EmbedType>>;
        modlogs: Array<queueData<modLogType>>;
        moderations: Array<queueData<moderationType>>;
        stars: Array<queueData<StarType>>;
        notes: Array<queueData<noteType>>;
        tags: Array<queueData<Record<string, never>>>;
    } = {
        guild: [],
        user: [],
        guilduser: [],
        embeds: [],
        modlogs: [],
        moderations: [],
        stars: [],
        notes: [],
        tags: []
    };
    constructor(Hyperion: hyperion){
        this.Hyperion = Hyperion;
        this._processQueues();
    }

    async _processQueues(): Promise<void> {
        for(const key of Object.keys(this.queues) as Array<keyof typeof rolePKey>){
            if(this.queues[key].length === 0){continue;}
            if(key === "guild"){this._gqh();}
            if(key === "user"){this._uqh();}
            if(key === "guilduser"){this._guqh();}
            if(key === "embeds"){this._eqh();}
            if(key === "stars"){this._sqh();}
            if(key === "modlogs"){this._mlqh();}
            if(key === "moderations"){this._mqh();}
            if(key === "notes"){this._nqh();}
        }
        setImmediate(this._processQueues.bind(this));
    }

    async _gqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.guild.shift()!;
        const rawCache = await this.Hyperion.redis.get(`ConfigCache:${toProcess.pKey[0]}`);
        const cache = rawCache !== null ? JSON.parse(rawCache) as GuildType : null;
        switch(toProcess.op){
        case "get": {
            if(cache){
                await this.Hyperion.redis.expire(`ConfigCache:${toProcess.pKey[0]}`, 15 * 60);
                toProcess.res(cache);
            }
            try{
                const result = await db.get<GuildType>("guild", toProcess.pKey);
                await this.Hyperion.redis.set(`ConfigCache:${toProcess.pKey[0]}`, JSON.stringify(result), "EX", 15 * 60);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            if(cache){
                await this.Hyperion.redis.expire(`ConfigCache:${toProcess.pKey[0]}`, 15 * 60);
                toProcess.res(cache);
            }
            try{
                const exists = await db.exists("guild", toProcess.pKey);
                if(exists){
                    const result = await db.get<GuildType>("guild", toProcess.pKey);
                    await this.Hyperion.redis.set(`ConfigCache:${toProcess.pKey[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<GuildType>("guild", toProcess.pKey);
                    await this.Hyperion.redis.set(`ConfigCache:${toProcess.pKey[0]}`, JSON.stringify(result), "EX", 15 * 60);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            if(cache){
                await this.Hyperion.redis.expire(`ConfigCache:${toProcess.pKey[0]}`, 15 * 60);
                toProcess.res(cache);
            }
            try{
                let result: GuildType;
                if(toProcess.data){
                    result = await this._createToAll("guild", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("guild", toProcess.pKey);
                }
                await this.Hyperion.redis.set(`ConfigCache:${toProcess.pKey[0]}`, JSON.stringify(result), "EX", 15 * 60);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<GuildType>("guild", toProcess.pKey, toProcess.data!);
                await this.Hyperion.redis.set(`ConfigCache:${toProcess.pKey[0]}`, JSON.stringify(result), "EX", 15 * 60);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _uqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.user.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<UserType>("user", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("user", toProcess.pKey);
                if(exists){
                    const result = await db.get<UserType>("user", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<UserType>("user", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: UserType;
                if(toProcess.data){
                    result = await this._createToAll("user", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("user", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<UserType>("user", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _guqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.guilduser.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<GuilduserType>("guilduser", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("guilduser", toProcess.pKey);
                if(exists){
                    const result = await db.get<GuilduserType>("guilduser", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<GuilduserType>("guilduser", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: GuilduserType;
                if(toProcess.data){
                    result = await this._createToAll("guilduser", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("guilduser", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<GuilduserType>("guilduser", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _eqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.embeds.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<EmbedType>("embeds", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("embeds", toProcess.pKey);
                if(exists){
                    const result = await db.get<EmbedType>("embeds", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<EmbedType>("embeds", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: EmbedType;
                if(toProcess.data){
                    result = await this._createToAll("embeds", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("embeds", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<EmbedType>("embeds", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _sqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.stars.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<StarType>("stars", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("stars", toProcess.pKey);
                if(exists){
                    const result = await db.get<StarType>("stars", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<StarType>("stars", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: StarType;
                if(toProcess.data){
                    result = await this._createToAll("stars", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("stars", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<StarType>("stars", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _mlqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.modlogs.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<modLogType>("modlogs", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("modlogs", toProcess.pKey);
                if(exists){
                    const result = await db.get<modLogType>("modlogs", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<modLogType>("modlogs", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: modLogType;
                if(toProcess.data){
                    result = await this._createToAll("modlogs", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("modlogs", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<modLogType>("modlogs", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _mqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.moderations.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<moderationType>("moderations", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("moderations", toProcess.pKey);
                if(exists){
                    const result = await db.get<moderationType>("moderations", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<moderationType>("moderations", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: moderationType;
                if(toProcess.data){
                    result = await this._createToAll("moderations", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("moderations", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<moderationType>("moderations", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    async _nqh(): Promise<void> {
        const db = this._getPrimaryDb();
        const toProcess = this.queues.notes.shift()!;
        switch(toProcess.op){
        case "get": {
            try{
                const result = await db.get<noteType>("notes", toProcess.pKey);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "getOrCreate": {
            try{
                const exists = await db.exists("notes", toProcess.pKey);
                if(exists){
                    const result = await db.get<noteType>("notes", toProcess.pKey);
                    toProcess.res(result);
                }else{
                    const result = await this._createToAll<noteType>("notes", toProcess.pKey);
                    toProcess.res(result);
                }
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "create": {
            try{
                let result: noteType;
                if(toProcess.data){
                    result = await this._createToAll("notes", toProcess.pKey, toProcess.data);
                }else{
                    result = await this._createToAll("notes", toProcess.pKey);
                }
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        case "update": {
            try{
                const result = await this._updateToAll<noteType>("notes", toProcess.pKey, toProcess.data!);
                toProcess.res(result);
            }catch(e){
                toProcess.rej(e);
            }
            break;
        }
        }
    }

    enqueue<T>(role: roles, pKey: Array<string>, op: "get" | "getOrCreate" | "create" | "update", data?: Partial<T>): Promise<T> {
        return new Promise<T>((res, rej) => {
            const qdat: queueData<T> = {
                res,
                rej,
                pKey,
                op
            };
            if(data){qdat.data = data;}
            (this.queues[role] as Array<queueData<T>>).push(qdat);
        });
    }

    _getPrimaryDb(){
        const entries = [...this.Hyperion.dbManagers.values()];
        const positions = entries.map(e => e.priority);
        return entries[positions.indexOf(Math.max(...positions))];
    }

    async _updateToAll<T>(role: roles, id: Array<string>, data: Partial<T>): Promise<T>{
        const exists = await this._getPrimaryDb().exists(role, id);
        if(!exists){
            return await this._createToAll<T>(role, id, data);
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

    async _createToAll<T>(role: roles, id: Array<string>, data?: Partial<T>){
        const results = await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.create<T>(role, id, data)));
        if(results[0].status === "rejected"){
            /*
            if(results[0].reason.message.startsWith("E11000")){
                return await this._getPrimaryDb().get<T>(role, id);
            }*/
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

    async _deleteToAll(role: roles, id: Array<string>){
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
                return await this._getPrimaryDb().exists(role, pKey);
            },
            create: async (data?: Partial<T>): Promise<T> => {
                let result: T;
                if(data){
                    result = await this.enqueue<T>(role, pKey, "create", data);
                }else{
                    result = await this.enqueue<T>(role, pKey, "create");
                }
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
            },
            delete: async () => {return await this._deleteToAll(role, pKey);},
            get: async () => {
                const result = await this.enqueue<T>(role, pKey, "get");
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
            },
            update: async (data: Partial<T>) => {
                const fallback = {} as Partial<T>;
                if(role === "guilduser"){
                    (fallback as Partial<GuilduserType>).guild = pKey[0];
                    (fallback as Partial<GuilduserType>).user = pKey[1];
                }else{
                    (fallback as any)[rolePKey[role]] = pKey[0];
                }
                const oldData = await this.enqueue<T>(role, pKey, "get").catch(() => undefined) ?? fallback as T;
                data = this._merge<T>(oldData, data);
                data = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.save(data);
                const result = await this.enqueue(role, pKey, "update", data);
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
            },
            getOrCreate: async () => {
                const result = await this.enqueue<T>(role, pKey, "getOrCreate");
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
            },
            raw: () => {
                return this._getPrimaryDb().raw<T>(role);
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

    _merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }
}