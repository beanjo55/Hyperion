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
        const name = role === "guilduser" ? `${pKey[0]}:${pKey[1]}` : pKey[0];
        
        return {
            exists: async () => {
                if(this.creating[name] !== undefined){await sleep(500);}
                return await this.getPrimaryDb().exists(role, pKey);
            },
            create: async (data?: Partial<T>): Promise<T> => {
                if(this.creating[name] !== undefined){
                    await sleep(500);
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                }
                this.creating[name] = 1;
                const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey, data)));
                await sleep(100);
                delete this.creating[name];
                return result;
            },
            delete: async () => {return await this.deleteToAll(role, pKey);},
            get: async () => {
                if(this.creating[name] !== undefined){await sleep(500);}
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
            },
            update: async (data: Partial<T>) => {
                if(this.creating[name] !== undefined){await sleep(500);}
                const oldData = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                data = this.merge<T>(oldData, data);
                data = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.save(data);
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.updateToAll(role, pKey, data), true);
            },
            getOrCreate: async () => {
                if(this.creating[name] !== undefined){await sleep(500);}
                const result = await this.getPrimaryDb().get<T>(role, pKey);
                if(!result){
                    this.creating[name] = 1;
                    const result = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey)));
                    await sleep(100);
                    delete this.creating[name];
                    return result;
                }else{
                    if(this.creating[name] !== undefined){
                        await sleep(1000);
                        return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                    }
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