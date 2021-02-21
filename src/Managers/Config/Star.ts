import hyperion, {StarType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class StarConfigManager extends BaseConfigManager<StarType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "stars"
        }, Hyperion, path);
    }

    format(data: Partial<StarType>): StarType {
        if(!data.guild){
            throw new Error("Guild must be specified for star data");
        }

        if(!data.channel){
            throw new Error("Channel must be specified for star data");
        }

        if(!data.message){
            throw new Error("Message must be specified for star data");
        }

        if(data.count === undefined){
            throw new Error("Count must be specified for star data");
        }
        return data as StarType;
    }
    
    save(data: Partial<StarType>): StarType {
        if(!data.guild){
            throw new Error("Guild must be specified for star data");
        }

        if(!data.channel){
            throw new Error("Channel must be specified for star data");
        }

        if(!data.message){
            throw new Error("Message must be specified for star data");
        }

        if(data.count === undefined){
            throw new Error("Count must be specified for star data");
        }
        if(data.starPost === ""){delete data.starPost;}
        if(data.starChannel === ""){delete data.starChannel;}
        if(data.origStars?.length === 0){delete data.origStars;}
        return data as StarType;
    }
}