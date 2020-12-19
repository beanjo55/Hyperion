import hyperion, {moderationType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class ModerationConfigManager extends BaseConfigManager<moderationType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "moderations"
        }, Hyperion, path);
    }

    format(data: Partial<moderationType>): moderationType {
        if(!data.mid || !data.user || !data.guild || !data.action || !data.start){throw new Error("Moderation missing required properties");}
        if(data.action === "persist" && (!data.roles || data.roles.length === 0)){throw new Error("Persist must specify roles");}
        if(data.action === "lock" && (!data.channels || data.channels.length === 0)){throw new Error("Lock must specify channels");}
        data.duration ??= 0;
        data.failCount ??= 0;
        return data as moderationType;
    }
}