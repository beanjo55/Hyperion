import hyperion, {modLogType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class ModLogConfigManager extends BaseConfigManager<modLogType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "modlogs"
        }, Hyperion, path);
    }

    format(data: Partial<modLogType>): modLogType {
        if(!data.mid){
            throw new Error("Mod Log MID must be supplied");
        }
        if(!data.user){
            throw new Error("Mod Log user must be supplied");
        }
        if(!data.guild){
            throw new Error("Mod Log guild must be supplied");
        }
        if(!data.moderator){
            throw new Error("Mod Log moderator must be supplied");
        }
        if(!data.caseNumber){
            throw new Error("Mod Log case number must be supplied");
        }
        if(!data.moderationType){
            throw new Error("Mod Log moderation type must be supplied");
        }
        if(!data.timeGiven){
            throw new Error("Mod Log time given must be supplied");
        }
        data.autoEnd ??= false;
        data.logChannel ??= "";
        data.logPost ??= "";
        return data as modLogType;
    }

    save(data: Partial<modLogType>): modLogType {
        return this.format(data);
    }
}