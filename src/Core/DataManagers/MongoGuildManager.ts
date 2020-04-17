/* eslint-disable no-unused-vars */
const guildmodel = require("../../MongoDB/Guild.js").default;
import * as Types from "../../types";
import {Embed, Collection} from "eris";
import {Command} from "../Structures/Command";
import {Module} from "../Structures/Module";

class MongoGuildManager{
    model: any;
    constructor(){
        this.model = guildmodel;
    }

    async createConfig(guildID: string): Promise<Types.GuildConfig>{
        return await this.model.create({guild: guildID});
    }

    async getConfig(guildID: string): Promise<Types.GuildConfig>{
        if(await this.model.exists({guild: guildID})){
            return await this.model.findOne({guild: guildID}).lean().exec();
        }else{
            return await this.createConfig(guildID);
        }
    }

    validateModuleState(state: boolean, module: string, modules: Collection<Module>){
        const mod: undefined | Module = modules.get(module);
        if(mod === undefined){return {code: 1, payload: "No matching module found"};}
        if(mod.private){return {code: 1, payload: "Module is private and not stored in config"};}
        if(!state && mod.alwaysEnabled){return {code: 1, payload: "This module is always enabled and may not be disabled"};}
        return {code: 0, payload: new ModuleConfig({enabled: state}, mod.defaultStatus)};
    }

    validateCommandState(data: any, command: string, commands: Collection<Command>){
        const cmd: Command | undefined = commands.get(command);
        if(!cmd){return {code: 1, payload: "Invalid command"};}
        const cmdConfig = new CommandConfig(data);
        if(!cmdConfig.enabled && cmd.alwaysEnabled){return {code: 1, payload: "This command can not be disabled"};}
        if(cmd.internal || cmd.dev || cmd.admin || cmd.support){return {code: 1, payload: "This command is private and can not be configured per server"};}
        return {code: 0, payload: new CommandConfig(data)};
    }

    async updateModuleStates(guildID: string, newMod: string, newState: boolean, modules: Collection<Module>){
        let guilddata = await this.model.findOne({guild: guildID}, "modules").lean().exec();
        if(!guilddata.modules){return {code: 1, payload: "An error occured"};}
        const validated: any = this.validateModuleState(newState, newMod, modules);
        if(validated.code !== 0){return validated;}
        const merged = this.merge(guilddata.modules, validated);
        return await this.model.updateOne({guild: guildID}, {modules: merged}).exec();
    }

    async updateCommands(guildID: string, newCmd: string, data: any, commands: Collection<Command>){
        let guilddata = await this.model.findOne({guild: guildID}, "commands").lean().exec();
        if(!guilddata.commands){return {code: 1, payload: "An error occured"};}
        const merged: any = this.merge(guilddata[newCmd], data);
        const validated: any = this.validateCommandState(merged, newCmd, commands);
        if(validated.code !== 0){return validated;}
        return await this.model.updateOne({guild: guildID}, {commands: merged}).exec();
    }

    async updateModuleConfig(guildID: string, mod: string, data: any){
        if(!Object.getOwnPropertyNames(nameConfigMap).includes(mod)){
            return {code: 1, payload: "No matching module found"};
        }
        let guilddata = await this.model.findOne({guild: guildID}, mod).lean().exec();
        if(!guilddata[mod]){return {code: 1, payload: "An error occured"};}
        let merged: any = this.merge(guilddata[mod], data);
        const validated: any = new nameConfigMap[mod](merged);
        let update: any = {};
        update[mod] = validated;
        return await this.model.updateOne({guild: guildID}, update).exec();
    }

    async update(guildID: string, update: any){
        return await this.model.updateOne({guild: guildID}, update).exec();
    }
    
    merge(oldData: any, newData: any){
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }
}




class CommandConfig implements Types.CommandConfig{
    enabled: Boolean;
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
    }
}

class ModuleConfig implements Types.ModuleConfig{
    enabled: Boolean;
    constructor(data: Types.ModuleConfig, defState: boolean){
        this.enabled = data.enabled ?? defState;
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
        this.messageType = data.messageType ?? "text";
        this.dm = data.dm ?? false;
    }
}

class TagConfig implements Types.TagConfig{
    allowedEditRoles: Array<string>;
    limitEdit: Boolean;
    delete: Boolean;
    tags: Array<Types.tag>;
    constructor(data: Partial<Types.TagConfig>){
        this.allowedEditRoles = data.allowedEditRoles ?? [];
        this.limitEdit = data.limitEdit ?? false;
        this.delete = data.delete ?? false;
        this.tags = data.tags ?? [];
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
export {MongoGuildManager as manager};