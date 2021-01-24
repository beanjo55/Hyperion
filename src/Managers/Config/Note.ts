import hyperion, {noteType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class ModLogConfigManager extends BaseConfigManager<noteType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "notes"
        }, Hyperion, path);
    }

    format(data: Partial<noteType>): noteType {
        if(!data.guild || !data.user || !data.mod || !data.content || !data.time || !data.id){throw new Error("Notes must supply all properties");}
        return data as noteType;
    }
    
    save(data: Partial<noteType>): noteType {
        return this.format(data);
    }
}