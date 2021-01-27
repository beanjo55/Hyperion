import hyperion, {moderationType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class ModerationConfigManager extends BaseConfigManager<moderationType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "moderations"
        }, Hyperion, path);
    }

    format(data: Partial<moderationType>): moderationType {
        if(!data.mid){
            throw new Error("Moderation MID must be supplied");
        }
        if(!data.user){
            throw new Error("Moderation user must be supplied");
        }
        if(!data.guild){
            throw new Error("Moderation guild must be supplied");
        }
        if(!data.action){
            throw new Error("Moderation action must be supplied");
        }
        if(!data.start){
            throw new Error("Moderation start must be supplied");
        }
        if(data.action === "persist" && (!data.roles || data.roles.length === 0)){throw new Error("Persist must specify roles");}
        if(data.action === "lock" && (!data.channels || data.channels.length === 0)){throw new Error("Lock must specify channels");}
        data.duration ??= 0;
        data.failCount ??= 0;
        return data as moderationType;
    }

    save(data: Partial<moderationType>): moderationType {
        return this.format(data);
    }
}