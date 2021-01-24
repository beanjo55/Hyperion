import hyperion, {GuilduserType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class GuilduserConfigManager extends BaseConfigManager<GuilduserType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "guilduser"
        }, Hyperion, path);
    }

    format(data: Partial<GuilduserType>): GuilduserType {
        if(data === null){return null as unknown as  GuilduserType;}
        if(data.guild === undefined || data.user === undefined){throw new Error("Guilduser must supply guild and user properties");}
        data.level ??= 0;
        data.exp ??= 0;
        data.highlights ??= [];
        return data as GuilduserType;
    }
    
    save(data: Partial<GuilduserType>): GuilduserType {
        data = this.format(data);
        if(data.highlights!.length === 0){delete data.highlights;}
        if(!data.level){delete data.level;}
        if(!data.exp){delete data.exp;}
        return data as GuilduserType;
    }
}