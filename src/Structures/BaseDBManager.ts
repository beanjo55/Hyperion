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

    async getGuild(id: string): Promise<GuildType> {
        throw new Error("unimplemented getGuild");
    }

    async updateGuild(id: string, data: Partial<GuildType>): Promise<GuildType> {
        throw new Error("unimplemented updateGuild");
    }

    rawGuild(): unknown {
        throw new Error("unimplemented rawGuild");
    }

    async getGuilduser(guild: string, user: string): Promise<GuilduserType> {
        throw new Error("unimplemented getGuilduser");
    }

    async updateGuilduser(guild: string, user: string, data: Partial<GuilduserType>): Promise<GuilduserType> {
        throw new Error("unimplemented updateGuilduser");
    }

    rawGuildUser(): unknown {
        throw new Error("unimplemented rawGuilduser");
    }

    async getUser(id: string): Promise<UserType> {
        throw new Error("unimplemented getUser");
    }

    async updateUser(id: string, data: Partial<UserType>): Promise<UserType> {
        throw new Error("unimplemented updateUser");
    }

    rawUser(): unknown {
        throw new Error("unimplemented rawUser");
    }

    async getEmbed(id: string): Promise<EmbedType> {
        throw new Error("unimplemented getEmbed");
    }

    async updateEmbed(id: string, data: Partial<EmbedType>): Promise<EmbedType> {
        throw new Error("unimplemented updateEmbed");
    }

    rawEmbed(): unknown {
        throw new Error("unimplemented rawEmbed");
    }

    async getStarByMessage(guild: string, id: string): Promise<StarType | null> {
        throw new Error("unimplemented getStarByMessage");
    }

    async getStarByStarpost(guild: string, id: string): Promise<StarType | null> {
        throw new Error("unimplemented getStarByStarpost");
    }

    async updateStar(guild: string, message: string,  data: Partial<StarType>): Promise<StarType> {
        throw new Error("unimplemented updateStar");
    }

    async deleteStar(guild: string, message: string): Promise<void> {
        throw new Error("unimplemented deleteStar");
    }

    rawStar(): unknown {
        throw new Error("unimplemented rawStar");
    }

    async getNote(guild: string, user: string, id: number): Promise<noteType | null> {
        throw new Error("unimplemented getNote");
    }

    async getNotes(guild: string, user: string): Promise<Array<noteType>> {
        throw new Error("unimplemented getNotes");
    }

    async updateNote(guild: string, user: string, id: number, data: Partial<noteType>): Promise<noteType> {
        throw new Error("unimplemented updateNote");
    }


    rawNote(): unknown {
        throw new Error("unimplemented rawNote");
    }

    async getModlog(id: string): Promise<modLogType | null> {
        throw new Error("unimplemented getModlog");
    }

    async updateModlog(id: string, data: Partial<modLogType>): Promise<modLogType> {
        throw new Error("unimplemented updateModlog");
    }

    rawModlog(): unknown {
        throw new Error("unimplemented rawModlog");
    }

    async getModeration(id: string): Promise<moderationType | null> {
        throw new Error("unimplemented getModeration");
    }

    async updateModeration(id: string, data: Partial<moderationType>): Promise<moderationType> {
        throw new Error("unimplemented updateModeration");
    }

    rawModeration(): unknown {
        throw new Error("unimplemented rawModeration");
    }

    async createModlog(data: Partial<modLogType>): Promise<modLogType> {
        throw new Error("unimplemented createModlog");
    }

    async createModeration(data: Partial<moderationType>): Promise<moderationType> {
        throw new Error("unimplemented createModeration");
    }

    async createNote(data: Partial<noteType>): Promise<noteType> {
        throw new Error("unimplemented createNote");
    }

    async createStar(data: Partial<StarType>): Promise<StarType> {
        throw new Error("unimplemented createStar");
    }
}