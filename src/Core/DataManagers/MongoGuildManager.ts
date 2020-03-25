const guildmodel = require("../../MongoDB/Guild.js").model;
import * as Types from "../../types";
import {Embed} from 'eris';


class MongoGuildManager{
    model: any;
    defaultModuleStates: any;
    constructor(defaultModuleStates: any){
        this.model = guildmodel;
        this.defaultModuleStates = defaultModuleStates;
    }

    async create(guildID: string){
        await this.model.create({guild: guildID}, this.defaultCallback);
    }

    async get(guildID: string){
        return await this.model.findOne({guild: guildID}, this.defaultCallback);
    }

    async update(guildID: string, data: any){
        return await this.model.updateOne({guild: guildID}, data, this.updateCallback);
    }

    async getPrefix(guildID: string){
        return await this.model.findOne({guild: guildID}, 'prefix', this.defaultCallback);
    }

    async setPrefix(guildID: string, newprefix: string){
        return await this.model.updateOne({guild: guildID}, {prefix: newprefix}, this.updateCallback);
    }

    async getModule(guildID: string, module: string){
        
    }

    async getModules(guildID: string){
        return await this.model.findOne({guild: guildID}, 'modules')
    }

    async setModule(guildID: string, module: string, status: Boolean, moduleList: Array<string>){
        let doc: any = await this.model.findOne({guild: guildID}, 'modules', this.defaultCallback);

    }

    async getCommand(guildID: string, command: string){

    }

    async updateCommand(guildID: string, command: string, data: any){

    }

    async getModuleConfig(guildID: string, module: string){
        if(!Object.keys(nameConfigMap).includes(module.toLowerCase())){
            return {code: 0, error: "Invalid module name"}
        }
    }

    async updateModuleConfig(guildID: string, module: string, data: any){

    }

    async defaultCallback(err: any, result: any){
        if(err && err !== null){
            return {
                status: {
                    code: 8,
                    error: err
                },
                payload: "Mongoose Error"
            }
        }else{
            return result;
        }
    }

    async updateCallback(err: any, writeResult: any){
        if(err && err !== null){
            return {
                status: {
                    code: 8,
                    error: err
                },
                payload: "Mongoose Error"
            }
        }else{
            return {
                status: {
                    code: 0
                },
                payload: writeResult
            };
        }
    }
}



class CommandConfig implements Types.CommandConfig{
    enabled: Boolean;
    allowedRoles: Array<string>;
    disabledRoles: Array<string>;
    allowedChannels: Array<string>;
    disabledChannels: Array<string>;
    constructor(data: Partial<Types.CommandConfig>){
        this.enabled = data.enabled ?? true;

        this.allowedRoles = data.allowedRoles ?? [];
        this.disabledRoles = data.disabledRoles ?? [];

        this.allowedChannels = data.allowedChannels ?? [];
        this.disabledChannels = data.allowedChannels ?? []
    }
}

class ModuleConfig implements Types.ModuleConfig{
    enabled: Boolean;
    name: string;
    constructor(data: Types.ModuleConfig){
        this.enabled = data.enabled;
        this.name = data.name;
    }
}

class ModConfig implements Types.ModConfig{
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    deleteAfter: Number;
    modLogChannel: string;
    requireReason: Boolean;
    requireMuteTime: Boolean;
    deleteOnBan: Boolean;
    deleteCommand: Boolean;
    constructor(data: Partial<Types.ModConfig>){
        this.modRoles = data.modRoles ?? [];
        this.protectedRoles = data.protectedRoles ?? [];

        this.deleteAfter = data.deleteAfter ?? -1;
        this.modLogChannel = data.modLogChannel ?? "";

        this.requireReason = data.requireReason ?? false;
        this.requireMuteTime = data.requireMuteTime ?? false;
        this.deleteOnBan = data.deleteOnBan ?? true;
        this.deleteCommand = data.deleteCommand ?? false;
    }
}

class StarboardConfig implements Types.StarboardConfig{
    starChannel: string;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    selfStar: Boolean;
    constructor(data: Partial<Types.StarboardConfig>){
        this.starChannel = data.starChannel ?? "";
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];

        this.selfStar = data.selfStar ?? false;
    }
}

class LoggingConfig implements Types.LoggingConfig{
    logChannel: string;
    ghostReactTime: Number;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    specifyChannels: Boolean;
    banAdd: Types.LogEvent;
    banRemove: Types.LogEvent;
    memberAdd: Types.LogEvent;
    memberRemove: Types.LogEvent;
    messageDelete: Types.LogEvent;
    messageEdit: Types.LogEvent;
    bulkDelete: Types.LogEvent;
    roleAdd: Types.LogEvent;
    roleUpdate: Types.LogEvent;
    roleDelete: Types.LogEvent;
    channelAdd: Types.LogEvent;
    channelUpdate: Types.LogEvent;
    channelDelete: Types.LogEvent;
    memberRoleAdd: Types.LogEvent;
    memberRoleRemove: Types.LogEvent;
    memberNicknameChange: Types.LogEvent;
    voiceJoin: Types.LogEvent;
    voiceSwitch: Types.LogEvent;
    voiceLeave: Types.LogEvent;
    guildUpdate: Types.LogEvent;
    webhookUpdate: Types.LogEvent;
    ghostReact: Types.LogEvent;
    constructor(data: Partial<Types.LoggingConfig>){
        this.logChannel = data.logChannel ?? "";
        this.ghostReactTime = data.ghostReactTime ?? 3;
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];
        this.specifyChannels = data.specifyChannels ?? false;

        this.banAdd = data.banAdd ?? {enabled: false, channel: "default"};
        this.banRemove = data.banRemove ?? {enabled: false, channel: "default"};
        this.memberAdd = data.memberAdd ?? {enabled: false, channel: "default"};
        this.memberRemove = data.memberRemove ?? {enabled: false, channel: "default"};
        this.messageDelete = data.messageDelete ?? {enabled: false, channel: "default"};
        this.messageEdit = data.messageEdit ?? {enabled: false, channel: "default"};
        this.bulkDelete = data.bulkDelete ?? {enabled: false, channel: "default"};
        this.roleAdd = data.roleAdd ?? {enabled: false, channel: "default"};
        this.roleUpdate = data.roleUpdate ?? {enabled: false, channel: "default"};
        this.roleDelete = data.roleDelete ?? {enabled: false, channel: "default"};
        this.channelAdd = data.channelAdd ?? {enabled: false, channel: "default"};
        this.channelUpdate = data.channelUpdate ?? {enabled: false, channel: "default"};
        this.channelDelete = data.channelDelete ?? {enabled: false, channel: "default"};
        this.memberRoleAdd = data.memberRoleAdd ?? {enabled: false, channel: "default"};
        this.memberRoleRemove = data.memberRoleRemove ?? {enabled: false, channel: "default"};
        this.memberNicknameChange = data.memberNicknameChange ?? {enabled: false, channel: "default"};
        this.voiceJoin = data.voiceJoin ?? {enabled: false, channel: "default"};
        this.voiceSwitch = data.voiceSwitch ?? {enabled: false, channel: "default"};
        this.voiceLeave = data.voiceLeave ?? {enabled: false, channel: "default"};
        this.guildUpdate = data.guildUpdate ?? {enabled: false, channel: "default"};
        this.webhookUpdate = data.webhookUpdate ?? {enabled: false, channel: "default"};
        this.ghostReact = data.ghostReact ?? {enabled: false, channel: "default"};
    }
}

class WelcomeConfig implements Types.WelcomeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: Boolean;
    constructor(data: Partial<Types.WelcomeConfig>){
        this.content = data.content ?? "";
        this.channel = data.channel ?? "";
        this.messageType = data.messageType ?? "text"
        this.dm = data.dm ?? false;
    }
}

class TagConfig implements Types.TagConfig{
    allowedEditRoles: Array<string>;
    limitEdit: Boolean;
    delete: Boolean;
    constructor(data: Partial<Types.TagConfig>){
        this.allowedEditRoles = data.allowedEditRoles ?? [];
        this.limitEdit = data.limitEdit ?? false;
        this.delete = data.delete ?? false;
    }
}

class RankConfig implements Types.RankConfig{
    limitOne: Boolean;
    limitOnePerGroup: Boolean;
    ranks: any;
    rankGroups: any;
    constructor(data: Partial<Types.RankConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        this.ranks = data.ranks ?? {};
        this.rankGroups = data.rankGroups ?? {};
    }
}

class RRConfig implements Types.RRConfig{
    limitOne: Boolean;
    limitOnePerGroup: Boolean;
    rr: any;
    rrGroups: any;
    constructor(data: Partial<Types.RRConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        this.rr = data.rr ?? {};
        this.rrGroups = data.rrGroups ?? {};
    }
}

class AutoroleConfig implements Types.AutoroleConfig{
    autoroles: any;
    removePrevious: Boolean;
    constructor(data: Partial<Types.AutoroleConfig>){
        this.autoroles = data.autoroles ?? {};
        this.removePrevious = data.removePrevious ?? false
    }
}

class SocialConfig implements Types.SocialConfig{
    ignoredChannels: Array<string>;
    levelupChannel: string;
    constructor(data: Partial<Types.SocialConfig>){
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.levelupChannel = data.levelupChannel ?? "";
    }
}
const nameConfigMap = {
    mod: ModConfig,
    command: CommandConfig,
    module: ModuleConfig,
    logging: LoggingConfig,
    tags: TagConfig,
    welcome: WelcomeConfig,
    starboard: StarboardConfig,
    rank: RankConfig,
    rr: RRConfig,
    social: SocialConfig,
    autorole: AutoroleConfig
}
exports.manager = MongoGuildManager;