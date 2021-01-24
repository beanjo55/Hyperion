/* eslint-disable @typescript-eslint/no-unused-vars */
import hyperion, {roles} from "../main";

export default abstract class BaseDatabaseManager {
    Hyperion: hyperion;
    db: string;
    priority: number;
    path: string;
    constructor(data: Partial<BaseDatabaseManager>, Hyperion: hyperion, path: string){
        if(!data.db || data.priority === undefined){throw new Error("DB, role, or priority not provided");}
        if(data.priority < 0){throw new Error("Priority must be 0 or greater");}
        this.db = data.db;
        this.priority = data.priority;
        this.Hyperion = Hyperion;
        this.path = path;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onLoad(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onUnoad(): void {}

    async create<T>(role: roles, pKey: Array<string>, data?: Partial<T>): Promise<T>{
        throw new Error("Unimplemented create!");
    }

    async delete(role: roles, pKey: Array<string>): Promise<unknown>{
        throw new Error("Unimplemented delete!");
    }

    async exists(role: roles, pKey: Array<string>): Promise<boolean>{
        throw new Error("Unimplemented exists!");
    }

    async update<T>(role: roles, pKey: Array<string>, data: Partial<T>): Promise<T>{
        throw new Error("Unimplemented update!");
    }

    async get<T>(role: roles, pKey: Array<string>): Promise<T>{
        throw new Error("Unimplemented get!");
    }

    raw<T>(role: roles): unknown {
        throw new Error("unimplemented raw");
    }
}