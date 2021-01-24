import hyperion, {UserType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class UserConfigManager extends BaseConfigManager<UserType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "user"
        }, Hyperion, path);
    }

    format(data: Partial<UserType>): UserType {
        if(data === null){return null as unknown as UserType;}
        if(data.user === undefined){throw new Error("User must supply user property");}
        data.rep ??= 0;
        data.repGiven ??= 0;
        data.money ??= 0;
        data.level ??= 0;
        data.exp ??= 0;
        data.lastRepTime ??= 0;
        data.lastDailyTime ??= 0;
        return data as UserType;
    }
    
    save(data: Partial<UserType>): UserType {
        const template = this.format({user: "dummy"});
        for(const key of Object.keys(data) as Array<keyof UserType>){
            if(data[key] === template[key]){delete data[key];}
        }
        return data as UserType;
    }
}