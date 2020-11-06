/* eslint-disable @typescript-eslint/no-unused-vars */
import hyperion from "../main";

export default class BaseDatabaseManager {
    Hyperion: hyperion;
    db: string;
    role: "guild" | "user" | "guilduser" | "modlog" | "embed" | "moderation";
    priority: number;
    constructor(data: Partial<BaseDatabaseManager>, Hyperion: hyperion){
        if(!data.db || !data.role || !data.priority){throw new Error("DB, role, or priority not provided");}
        if(data.priority < 0){throw new Error("Priority must be 0 or greater");}
        this.db = data.db;
        this.role = data.role;
        this.priority = data.priority;
        this.Hyperion = Hyperion;
    }

    async create(data: unknown): Promise<unknown>{
        throw new Error("Unimplemented create!");
    }

    async delete(data: unknown): Promise<unknown>{
        throw new Error("Unimplemented delete!");
    }

    async exists(data: unknown): Promise<boolean>{
        throw new Error("Unimplemented exists!");
    }

    async update(data: unknown): Promise<unknown>{
        throw new Error("Unimplemented update!");
    }

    async get(data: unknown): Promise<unknown>{
        throw new Error("Unimplemented get!");
    }
}