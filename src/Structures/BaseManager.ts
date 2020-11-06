import hyperion from "../main";

export default class BaseManager {
    name: string;
    role: "guild" | "user" | "guilduser"
    Hyperion: hyperion;
    constructor(data: Partial<BaseManager>, Hyperion: hyperion) {
        if(!data.name || !data.role){throw new Error("Manager name or role is not provided");}
        this.name = data.name;
        this.role = data.role;
        this.Hyperion = Hyperion;
    }
}