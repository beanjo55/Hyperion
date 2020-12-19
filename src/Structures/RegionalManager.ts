import hyperion, {roles, GuildType, modLogType, moderationType, noteType} from "../main";
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
        const results =  await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.update<T>(role, id, data)));
        return (results[0] as PromiseFulfilledResult<T>)?.value ?? {} as T;
    }

    async createToAll<T>(role: roles, id: Array<string>, data?: Partial<T>){
        const results = await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.create<T>(role, id)));
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
            exists: async () => {return await this.getPrimaryDb().exists(role, pKey);},
            create: async (data?: Partial<T>): Promise<T> => {
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey, data)));
            },
            delete: async () => {return await this.deleteToAll(role, pKey);},
            get: async () => {return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));},
            update: async (data: Partial<T>) => {
                const oldData = (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));
                data = this.merge<T>(oldData, data);
                return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.updateToAll(role, pKey, data), true);
            },
            getOrCreate: async () => {
                const result = await this.getPrimaryDb().get<T>(role, pKey);
                if(!result){
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey)));
                }else{
                    return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(result);
                }
            }
        };
    }

    guild(id: string){
        return this.doOps<GuildType>("guild", id);
    }

    user<T>(id: string){
        return this.doOps<T>("user", id);
    }

    guilduser<T>(guild: string, user: string){
        return this.doOps<T>("guilduser", guild, user);
    }

    embeds<T>(id: string){
        return this.doOps<T>("embeds", id);
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

    stars<T>(id: string){
        return this.doOps<T>("stars", id);
    }

    merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }
}