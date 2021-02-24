/* eslint-disable @typescript-eslint/no-unused-vars */
import hyperion, {EmbedType, GuildType, GuilduserType, moderationType, modLogType, noteType, roles, StarType, UserType} from "../main";

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

    abstract getGuild(id: string): Promise<GuildType>
    abstract updateGuild(id: string, data: Partial<GuildType>): Promise<GuildType> 
    abstract rawGuild(): unknown

    abstract getGuilduser(guild: string, user: string): Promise<GuilduserType> 
    abstract updateGuilduser(guild: string, user: string, data: Partial<GuilduserType>): Promise<GuilduserType> 
    abstract rawGuildUser(): unknown

    abstract getUser(id: string): Promise<UserType> 
    abstract updateUser(id: string, data: Partial<UserType>): Promise<UserType> 
    abstract rawUser(): unknown

    abstract getEmbed(id: string): Promise<EmbedType> 
    abstract updateEmbed(id: string, data: Partial<EmbedType>): Promise<EmbedType> 
    abstract rawEmbed(): unknown

    abstract getStarByMessage(guild: string, id: string): Promise<StarType | null>
    abstract getStarByStarpost(guild: string, id: string): Promise<StarType | null>
    abstract updateStar(guild: string, message: string,  data: Partial<StarType>): Promise<StarType>
    abstract deleteStar(guild: string, message: string): Promise<void>
    abstract rawStar(): unknown
    abstract createStar(data: Partial<StarType>): Promise<StarType>

    abstract getNote(guild: string, user: string, id: number): Promise<noteType | null>
    abstract getNotes(guild: string, user: string): Promise<Array<noteType>>
    abstract updateNote(guild: string, user: string, id: number, data: Partial<noteType>): Promise<noteType>
    abstract createNote(data: Partial<noteType>): Promise<noteType>
    abstract rawNote(): unknown

    abstract getModlog(id: string): Promise<modLogType | null>
    abstract updateModlog(id: string, data: Partial<modLogType>): Promise<modLogType>
    abstract rawModlog(): unknown
    abstract createModlog(data: Partial<modLogType>): Promise<modLogType>

    abstract getModeration(id: string): Promise<moderationType | null>
    abstract updateModeration(id: string, data: Partial<moderationType>): Promise<moderationType>
    abstract rawModeration(): unknown
    abstract createModeration(data: Partial<moderationType>): Promise<moderationType>
}