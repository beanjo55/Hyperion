import hyperion, {modLogType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class ModLogConfigManager extends BaseConfigManager<modLogType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "modlogs"
        }, Hyperion, path);
    }

    format(data: Partial<modLogType>): modLogType {
        if(!data.mid || !data.user || !data.guild || !data.moderator || !data.caseNumber || !data.moderationType || !data.timeGiven){throw new Error("Log missing required properties");}
        data.hidden ??= false;
        data.autoEnd ??= false;
        data.logChannel ??= "";
        data.logPost ??= "";
        return data as modLogType;
    }

    save(data: Partial<modLogType>): modLogType {
        return this.format(data);
    }
}