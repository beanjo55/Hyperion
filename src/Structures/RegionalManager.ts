import hyperion, {roles, GuildType} from "../main";
import BaseConfigManager from "./BaseConfigManager";

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
        return (results[0] as PromiseFulfilledResult<T>)?.value ?? {};
    }

    async createToAll<T>(role: roles, id: Array<string>){
        const results = await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.create<T>(role, id)));
        return (results[0] as PromiseFulfilledResult<T>)?.value ?? {};
    }

    async deleteToAll(role: roles, id: Array<string>){
        return await Promise.allSettled([...this.Hyperion.dbManagers.values()].map(e => e.delete(role, id)));
    }

    doOps<T>(role: roles, id: string, user?: string){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blank: any = {};
        blank[role] = id;
        const pKey = [id];
        if(user){
            pKey.push(user);
            blank.user = user;
        }
        return {
            exists: async () => {return await this.getPrimaryDb().exists(role, pKey);},
            create: async () => {return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format((await this.createToAll<T>(role, pKey)));},
            delete: async () => {return await this.deleteToAll(role, pKey);},
            get: async () => {return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.getPrimaryDb().get<T>(role, pKey));},
            update: async (data: Partial<T>) => {return (this.Hyperion.configManagers.get(role) as BaseConfigManager<T>)!.format(await this.updateToAll(role, pKey, data), true);},
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

    moderations<T>(id: string){
        return this.doOps<T>("moderations", id);
    }

    modlogs<T>(id: string){
        return this.doOps<T>("modlogs", id);
    }
}