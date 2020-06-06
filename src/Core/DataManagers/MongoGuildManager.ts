/* eslint-disable no-unused-vars */
import {IGuild, IGuildDoc, IGuildModel, default as model} from "../../MongoDB/Guild";
import * as Types from "../../types";
import {Embed, Collection} from "eris";
import {Command} from "../Structures/Command";
import {Module} from "../Structures/Module";


class CommandConfig implements Types.CommandConfig{
    enabled: boolean;
    allowedRoles: Array<string>;
    disabledRoles: Array<string>;
    allowedChannels: Array<string>;
    disabledChannels: Array<string>;
    subcommands?: Array<Types.CommandConfig>;
    name?: string;
    constructor(data: Partial<Types.CommandConfig>){
        this.enabled = data.enabled ?? true;

        this.allowedRoles = data.allowedRoles ?? [];
        this.disabledRoles = data.disabledRoles ?? [];

        this.allowedChannels = data.allowedChannels ?? [];
        this.disabledChannels = data.allowedChannels ?? [];

        if(data.subcommands !== undefined){
            this.subcommands = data.subcommands;
        }
        if(data.name){
            this.name = data.name;
        }
    }
}

class ModuleConfig implements Types.ModuleConfig{
    enabled: boolean;
    constructor(data: Types.ModuleConfig, defState: boolean){
        this.enabled = data.enabled ?? defState;
    }
}

class ModConfig implements Types.ModConfig{
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    deleteAfter: number;
    modLogChannel: string;
    requireReason: boolean;
    requireMuteTime: boolean;
    deleteOnBan: boolean;
    deleteCommand: boolean;
    lastCase: number;
    muteRole: string;
    constructor(data: Partial<Types.ModConfig>){
        this.modRoles = data.modRoles ?? [];
        this.protectedRoles = data.protectedRoles ?? [];

        this.deleteAfter = data.deleteAfter ?? -1;
        this.modLogChannel = data.modLogChannel ?? "";

        this.requireReason = data.requireReason ?? false;
        this.requireMuteTime = data.requireMuteTime ?? false;
        this.deleteOnBan = data.deleteOnBan ?? true;
        this.deleteCommand = data.deleteCommand ?? false;
        this.lastCase = data.lastCase ?? 0;
        this.muteRole = data.muteRole ?? "";
    }
}

class StarboardConfig implements Types.StarboardConfig{
    starChannel: string;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    selfStar: boolean;
    customStar: string;
    starCount: number;
    constructor(data: Partial<Types.StarboardConfig>){
        this.starChannel = data.starChannel ?? "";
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];

        this.selfStar = data.selfStar ?? false;
        this.customStar = data.customStar ?? "";
        this.starCount = data.starCount ?? 3;
    }
}

const defaultLog: Types.LogEvent = {
    enabled: false,
    channel: "default",
    ignoredRoles: [],
    ignoredChannels: []
};
export class LoggingConfig implements Types.LoggingConfig{
    logChannel: string;
    ghostReactTime: number;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    specifyChannels: boolean;
    newAccountAge: number;
    showAvatar: boolean;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any
    constructor(data: Partial<Types.LoggingConfig>){
        this.logChannel = data.logChannel ?? "";
        this.ghostReactTime = data.ghostReactTime ?? 3;
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];
        this.specifyChannels = data.specifyChannels ?? false;
        this.newAccountAge = data.newAccountAge ?? 0;
        this.showAvatar = data.showAvatar ?? false;

        this.banAdd = data.banAdd ?? defaultLog;
        this.banRemove = data.banRemove ?? defaultLog;
        this.memberAdd = data.memberAdd ?? defaultLog;
        this.memberRemove = data.memberRemove ?? defaultLog;
        this.messageDelete = data.messageDelete ?? defaultLog;
        this.messageEdit = data.messageEdit ?? defaultLog;
        this.bulkDelete = data.bulkDelete ?? defaultLog;
        this.roleAdd = data.roleAdd ?? defaultLog;
        this.roleUpdate = data.roleUpdate ?? defaultLog;
        this.roleDelete = data.roleDelete ?? defaultLog;
        this.channelAdd = data.channelAdd ?? defaultLog;
        this.channelUpdate = data.channelUpdate ?? defaultLog;
        this.channelDelete = data.channelDelete ?? defaultLog;
        this.memberRoleAdd = data.memberRoleAdd ?? defaultLog;
        this.memberRoleRemove = data.memberRoleRemove ?? defaultLog;
        this.memberNicknameChange = data.memberNicknameChange ?? defaultLog;
        this.voiceJoin = data.voiceJoin ?? defaultLog;
        this.voiceSwitch = data.voiceSwitch ?? defaultLog;
        this.voiceLeave = data.voiceLeave ?? defaultLog;
        this.guildUpdate = data.guildUpdate ?? defaultLog;
        this.webhookUpdate = data.webhookUpdate ?? defaultLog;
        this.ghostReact = data.ghostReact ?? defaultLog;
    }
}

class WelcomeConfig implements Types.WelcomeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: boolean;
    constructor(data: Partial<Types.WelcomeConfig>){
        this.content = data.content ?? "";
        this.channel = data.channel ?? "";
        this.messageType = data.messageType ?? "text";
        this.dm = data.dm ?? false;
    }
}

class TagConfig implements Types.TagConfig{
    allowedEditRoles: Array<string>;
    limitEdit: boolean;
    delete: boolean;
    tags: Array<Types.Tag>;
    constructor(data: Partial<Types.TagConfig>){
        this.allowedEditRoles = data.allowedEditRoles ?? [];
        this.limitEdit = data.limitEdit ?? false;
        this.delete = data.delete ?? false;
        this.tags = data.tags ?? [];
    }
}

class RankConfig implements Types.RankConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ranks: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rankGroups: any;
    constructor(data: Partial<Types.RankConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        this.ranks = data.ranks ?? {};
        this.rankGroups = data.rankGroups ?? {};
    }
}

class RRConfig implements Types.RRConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rr: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rrGroups: any;
    constructor(data: Partial<Types.RRConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        this.rr = data.rr ?? {};
        this.rrGroups = data.rrGroups ?? {};
    }
}

class AutoroleConfig implements Types.AutoroleConfig{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoroles: any;
    removePrevious: boolean;
    constructor(data: Partial<Types.AutoroleConfig>){
        this.autoroles = data.autoroles ?? {};
        this.removePrevious = data.removePrevious ?? false;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nameConfigMap: any = {
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
};

class MongoGuildManager{
    model: IGuildModel;
    constructor(){
        this.model = model;
    }

    async createConfig(guildID: string): Promise<IGuildDoc>{
        return await this.model.create({guild: guildID});
    }

    async getConfig(guildID: string): Promise<IGuildDoc | IGuild | null>{
        if(await this.model.exists({guild: guildID})){
            return await this.model.findOne({guild: guildID}).lean<IGuild>().exec();
        }else{
            return await this.createConfig(guildID);
        }
    }

    async exists(guildID: string): Promise<boolean>{
        return await this.model.exists({guild: guildID});
    }

    async getPrefix(guildID: string): Promise<string>{
        const doc: IGuild  | null = await this.getConfig(guildID);
        if(!doc){return "%";}
        if(!doc.prefix){return "%";}
        if(doc.prefix === ""){return "%";}
        return doc.prefix;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setPrefix(guildID: string, newPrefix: string): Promise<any>{
        return await this.model.updateOne({guild: guildID}, {prefix: newPrefix});
    }

    async getMods(guildID: string): Promise<Array<string>>{
        const guildConfig: IGuild  | null = await this.getConfig(guildID);
        if(!guildConfig?.mod){return [];}
        if(guildConfig.mod === {}){return [];}
        const roles = (guildConfig.mod as Types.ModConfig)?.modRoles;
        if(!roles){return [];}
        return roles;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateModuleState(state: boolean, module: string, modules: Collection<Module>): any{
        const mod: undefined | Module = modules.get(module);
        if(mod === undefined){return {code: 1, payload: "No matching module found"};}
        if(mod.private){return {code: 1, payload: "Module is private and not stored in config"};}
        if(!state && mod.alwaysEnabled){return {code: 1, payload: "This module is always enabled and may not be disabled"};}
        return {code: 0, payload: new ModuleConfig({enabled: state}, mod.defaultStatus)};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateCommandState(data: any, command: string, commands: Collection<Command>): any{
        const cmd: Command | undefined = commands.get(command);
        if(!cmd){return {code: 1, payload: "Invalid command"};}
        const cmdConfig = new CommandConfig(data);
        if(!cmdConfig.enabled && cmd.alwaysEnabled){return {code: 1, payload: "This command can not be disabled"};}
        if(cmd.internal || cmd.dev || cmd.admin || cmd.support){return {code: 1, payload: "This command is private and can not be configured per server"};}
        return {code: 0, payload: new CommandConfig(data)};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateModuleStates(guildID: string, newMod: string, newState: boolean, modules: Collection<Module>): Promise<any>{
        const guilddata = await this.model.findOne({guild: guildID}, "modules").lean().exec();
        if(!guilddata?.modules){return {code: 1, payload: "An error occured"};}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validated: any = this.validateModuleState(newState, newMod, modules);
        if(validated.code !== 0){return validated;}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temp: any ={};
        temp[newMod] = validated.payload;
        const merged = this.merge(guilddata.modules, temp);
        return await this.model.updateOne({guild: guildID}, {modules: merged}).exec();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateCommands(guildID: string, newCmd: string, data: any, commands: Collection<Command>): Promise<any>{
        const guilddata = await this.model.findOne({guild: guildID}, "commands").lean().exec();
        if(!guilddata?.commands){return {code: 1, payload: "An error occured"};}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validated: any = this.validateCommandState(data, newCmd, commands);
        if(validated.code !== 0){return validated;}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temp: any = {};
        temp[newCmd] = validated.payload;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const merged: any = this.merge(guilddata.commands, temp);
        return await this.model.updateOne({guild: guildID}, {commands: merged}).exec();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateModuleConfig(guildID: string, mod: string, data: any): Promise<any>{
        if(!Object.getOwnPropertyNames(nameConfigMap).includes(mod)){
            return {code: 1, payload: "No matching module found"};
        }
        let guilddata = await this.model.findOne({guild: guildID}, mod).lean().exec();
        if(!guilddata){guilddata = await this.createConfig(guildID);}
        if(!guilddata?.[mod]){return {code: 1, payload: "An error occured"};}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const merged: any = this.merge(guilddata?.[mod], data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validated: any = new nameConfigMap[mod](merged);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = {};
        update[mod] = validated;
        return await this.model.updateOne({guild: guildID}, update).exec();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async update(guildID: string, update: any): Promise<any>{
        return await this.model.updateOne({guild: guildID}, update).exec();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merge(oldData: any, newData: any): any{
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }
}





export {MongoGuildManager as manager};
