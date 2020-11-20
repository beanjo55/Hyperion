import hyperion, {GuildType} from "../../main";
import BaseConfigManager from "../../Structures/BaseConfigManager";

export default class GuildConfigManager extends BaseConfigManager<GuildType> {
    constructor(Hyperion: hyperion, path: string){
        super({
            role: "guild"
        }, Hyperion, path);
    }

    format(data: Partial<GuildType>, update?: boolean): GuildType {
        if(!data.guild){throw new Error("Guild id must be specified");}
        data.pro ??= false;
        data.deleted ??= false;
        data.deletedAt ??= 0;
        data.casualPrefix ??= false;
        data.embedCommonResponses ??= false;
        data.cantRunMessage ??= false;
        data.ignoredChannels ??= [];
        data.ignoredRoles ??= [];
        data.ignoredUsers ??= [];
        data.prefix ??= "%";
        data.commands ??= {};
        data.modules ??= {};
        this.Hyperion.modules.forEach(m => {
            if(m.config){
                data[m.name] = m.formatConfig(data[m.name] ?? {});
            }
        });
        try{
            this.validateModules(data as GuildType);
            this.validateCommands(data as GuildType);
        }catch(err){
            throw new Error("Validation Failed: " + err.message);
        }
        if(update){
            data.updatedAt = Date.now();
        }else{
            data.updatedAt ??= 0;
        }
        return data as GuildType;
    }

    validateModules(data: GuildType): void {
        const names = Object.keys(data.modules);
        if(names.length === 0){return;}
        for(const name of names){
            const module = this.Hyperion.modules.get(name);
            if(module){
                if(module.private){throw new Error("Tried to specify a status for a private module");}
                if(module.alwaysEnabled){throw new Error("Tried to specify a status for an always enabled module");}
            }
        }
    }

    validateCommands(data: GuildType): void {
        const names = Object.keys(data.commands);
        if(names.length === 0){return;}
        for(const name of names){
            const command = this.Hyperion.commands.get(name);
            if(command){
                if(command.private){throw new Error("Tried to specify a status for a private command");}
                if(command.alwaysEnabled){throw new Error("Tried to specify a status for an always enabled command");}
            }
        }
    }
    
}