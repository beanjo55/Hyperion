/* eslint-disable complexity */
import * as Types from "../types";
import {Embed, Collection} from "eris";
import {Command} from "../Structures/Command";
import {Module} from "../Structures/Module";
import hyperion from "../../main";
import {GuildType} from "../../main";




export class CommandConfig{
    enabled: boolean;
    allowedRoles: Array<string>;
    disabledRoles: Array<string>;
    allowedChannels: Array<string>;
    disabledChannels: Array<string>;
    //subcommands?: Array<CommandConfig>;
    name?: string;
    constructor(data: Partial<CommandConfig>){
        this.enabled = data.enabled ?? true;

        this.allowedRoles = data.allowedRoles ?? [];
        this.disabledRoles = data.disabledRoles ?? [];

        this.allowedChannels = data.allowedChannels ?? [];
        this.disabledChannels = data.disabledChannels ?? [];

        if(data.name){
            this.name = data.name;
        }
    }
}

export class ModuleConfig{
    enabled: boolean;
    constructor(data: ModuleConfig, defState: boolean){
        this.enabled = data.enabled ?? defState;
    }
}

export class ModConfig{
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    modLogChannel: string;
    requireReason: boolean;
    requireMuteTime: boolean;
    deleteOnBan: boolean;
    deleteCommand: boolean;
    lastCase: number;
    muteRole: string;
    dmOnBan: boolean;
    dmOnKick: boolean;
    dmOnMute: boolean;
    dmOnUnmute: boolean;
    banLogChannel: string;
    warnLogChannel: string;
    muteLogChannel: string;
    kickLogChannel: string;
    protectWarns: boolean;
    manageMuteRole: boolean;
    constructor(data: Partial<ModConfig>){
        this.modRoles = data.modRoles ?? [];
        this.protectedRoles = data.protectedRoles ?? [];
        this.protectWarns = data.protectWarns ?? false;

        this.modLogChannel = data.modLogChannel ?? "";

        this.requireReason = data.requireReason ?? false;
        this.requireMuteTime = data.requireMuteTime ?? false;
        this.deleteOnBan = data.deleteOnBan ?? true;
        this.deleteCommand = data.deleteCommand ?? false;
        this.lastCase = data.lastCase ?? 0;
        this.muteRole = data.muteRole ?? "";
        
        this.dmOnBan = data.dmOnBan ?? false;
        this.dmOnKick = data.dmOnKick ?? false;
        this.dmOnMute = data.dmOnMute ?? false;
        this.dmOnUnmute = data.dmOnUnmute ?? false;

        this.banLogChannel = data.banLogChannel ?? "";
        this.kickLogChannel = data.kickLogChannel ?? "";
        this.muteLogChannel = data.muteLogChannel ?? "";
        this.warnLogChannel = data.warnLogChannel ?? "";

        this.manageMuteRole = data.manageMuteRole ?? true;
    }
}

export class StarboardConfig{
    starChannel: string;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    selfStar: boolean;
    customStar: string;
    starCount: number;
    constructor(data: Partial<StarboardConfig>){
        this.starChannel = data.starChannel ?? "";
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];

        this.selfStar = data.selfStar ?? false;
        this.customStar = data.customStar ?? "";
        this.starCount = data.starCount ?? 3;
    }
}

export const defaultLog: Types.LogEvent = {
    enabled: false,
    channel: "default",
    ignoredRoles: [],
    ignoredChannels: [],
};

export class LogEvent {
    enabled: boolean;
    channel: string;
    ignoredRoles: Array<string>;
    ignoredChannels: Array<string>;
    constructor(data: Partial<LogEvent>){
        this.enabled = data.enabled ?? false;
        this.channel = data.channel ?? "default";
        this.ignoredRoles = data.ignoredRoles ?? [];
        this.ignoredChannels = data.ignoredChannels ?? [];
    }
}
export class LoggingConfig{
    logChannel: string;
    ghostReactTime: number;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    specifyChannels: boolean;
    newAccountAge: number;
    showAvatar: boolean;
    prevCasesOnJoin: boolean;
    alwaysShowAge: boolean;
    banAdd: LogEvent;
    banRemove: LogEvent;
    memberAdd: LogEvent;
    memberRemove: LogEvent;
    messageDelete: LogEvent;
    messageEdit: LogEvent;
    bulkDelete: LogEvent;
    roleAdd: LogEvent;
    roleUpdate: LogEvent;
    roleDelete: LogEvent;
    channelAdd: LogEvent;
    channelUpdate: LogEvent;
    channelDelete: LogEvent;
    memberRoleAdd: LogEvent;
    memberRoleUpdate: LogEvent;
    memberRoleRemove: LogEvent;
    memberNicknameChange: LogEvent;
    voiceJoin: LogEvent;
    voiceSwitch: LogEvent;
    voiceLeave: LogEvent;
    guildUpdate: LogEvent;
    webhookUpdate: LogEvent;
    ghostReact: LogEvent;
    channelPermsUpdate: LogEvent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any
    constructor(data: Partial<LoggingConfig>){
        this.logChannel = data.logChannel ?? "";
        this.ghostReactTime = data.ghostReactTime ?? 3;
        this.ignoredChannels = data.ignoredChannels ?? [];
        this.ignoredRoles = data.ignoredRoles ?? [];
        this.specifyChannels = data.specifyChannels ?? false;
        this.newAccountAge = data.newAccountAge ?? 5;
        this.showAvatar = data.showAvatar ?? false;
        this.prevCasesOnJoin = data.prevCasesOnJoin ?? true;
        this.alwaysShowAge = data.alwaysShowAge ?? false;

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
        this.memberRoleUpdate = data.memberRoleUpdate?? defaultLog;
        this.memberNicknameChange = data.memberNicknameChange ?? defaultLog;
        this.voiceJoin = data.voiceJoin ?? defaultLog;
        this.voiceSwitch = data.voiceSwitch ?? defaultLog;
        this.voiceLeave = data.voiceLeave ?? defaultLog;
        this.guildUpdate = data.guildUpdate ?? defaultLog;
        this.webhookUpdate = data.webhookUpdate ?? defaultLog;
        this.ghostReact = data.ghostReact ?? defaultLog;
        this.channelPermsUpdate = data.channelPermsUpdate ?? defaultLog;
    }
}

export class WelcomeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: boolean;
    constructor(data: Partial<WelcomeConfig>){
        this.content = data.content ?? "";
        this.channel = data.channel ?? "";
        this.messageType = data.messageType ?? "text";
        this.dm = data.dm ?? false;
    }
}

export class GoodbyeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: boolean;
    constructor(data: Partial<GoodbyeConfig>){
        this.content = data.content ?? "";
        this.channel = data.channel ?? "";
        this.messageType = data.messageType ?? "text";
        this.dm = data.dm ?? false;
    }
}

export class TagConfig{
    allowedEditRoles: Array<string>;
    limitEdit: boolean;
    delete: boolean;
    tags: Array<Types.Tag>;
    constructor(data: Partial<TagConfig>){
        this.allowedEditRoles = data.allowedEditRoles ?? [];
        this.limitEdit = data.limitEdit ?? false;
        this.delete = data.delete ?? false;
        this.tags = data.tags ?? [];
    }
}

export class RankConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ranks: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rankGroups: any;
    constructor(data: Partial<RankConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        this.ranks = data.ranks ?? {};
        this.rankGroups = data.rankGroups ?? {};
    }
}

export class ReactionRole{
    channel: string;
    erMap: Map<string, string>;
    linkedMessages: Array<string>;
    constructor(data: Partial<ReactionRole>){
        this.channel = data.channel ?? "";
        if(data.erMap){
            if(!(data.erMap instanceof Map)){
                this.erMap = new Map(Object.entries(data.erMap));
            }else{
                this.erMap = data.erMap;
            }
        }else{
            this.erMap = new Map();
        }
        this.linkedMessages = data.linkedMessages ?? [];
    }
}

export class RRConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    rr: Map<string, ReactionRole>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rrGroups: any;
    rrMessages: Map<string, string>
    constructor(data: Partial<RRConfig>){
        this.limitOne = data.limitOne ?? false;
        this.limitOnePerGroup = data.limitOnePerGroup ?? false;

        if(data.rr){
            if(!(data.rr instanceof Map)){
                this.rr = new Map<string, ReactionRole>(Object.entries(data.rr).map(data => [data[0], new ReactionRole(data[1] as ReactionRole)]));
            }else{
                this.rr = data.rr;
            }
        }else{
            this.rr = new Map<string, ReactionRole>();
        }

        if(data.rrMessages){
            if(!(data.rrMessages instanceof Map)){
                this.rrMessages = new Map<string, string>(Object.entries(data.rrMessages));
            }else{
                this.rrMessages = data.rrMessages;
            }
        }else{
            this.rrMessages = new Map<string, string>();
        }
        this.rrGroups = data.rrGroups ?? {};
    }
}

export class AutoroleConfig{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoroles: any;
    removePrevious: boolean;
    constructor(data: Partial<AutoroleConfig>){
        this.autoroles = data.autoroles ?? {};
        this.removePrevious = data.removePrevious ?? false;
    }
}

export class QuoteConfig{
    quoteLinks: boolean;
    guildQuotes: Map<number, Quote>;
    constructor(data: Partial<QuoteConfig>){
        this.quoteLinks = data.quoteLinks ?? true;
        this.guildQuotes = data.guildQuotes ?? new Map<number, Quote>();
    }
}
export class Quote{
    user: string;
    link: string;
    channel: string;
    content: string;
    image?: string;
    constructor(data: Partial<Quote>){
        this.user = data.user ?? "";
        this.link = data.link ?? "";
        this.channel = data.channel ?? "";
        this.content = data.content ?? "";
        this.image = data.image;
    }
}

export class VTL{
    joinAnnouncements: boolean;
    leaveAnnouncements: boolean;
    links: {[key: string]: string}
    constructor(data: Partial<VTL>){
        this.joinAnnouncements = data.joinAnnouncements ?? false;
        this.leaveAnnouncements = data.leaveAnnouncements ?? false;
        this.links = data.links ?? {};
    }
}
export class SocialConfig{
    ignoredChannels: Array<string>;
    constructor(data: Partial<SocialConfig>){
        this.ignoredChannels = data.ignoredChannels ?? [];
    }
}
export class LevelsConfig{
    expRoles: {[key: number]: {role: string; global: boolean; exp: number}};
    lvlRoles: {[key: number]: {role: string; global: boolean}; [key: string]: {role: string; global: boolean}};
    lvlUpSetting: "none" | "current" | string;

    constructor(data: Partial<LevelsConfig>){
        this.expRoles = data.expRoles ?? {};
        this.lvlRoles = data.lvlRoles ?? {};
        this.lvlUpSetting = data.lvlUpSetting ?? "none";
    }
}

export class SuggestionsConfig{
    lastSuggestion: number;
    suggestionChannel: string;
    suggestions: {[key: number]: {
        msg: string; 
        status: "none" | "accepted" | "denied" | "considered" | "custom"; 
        cStatus?: string; 
        suggestor: string; 
        description: string; 
        reason?: string;
        reviewer?: string;
    }};
    checkOtherSuggestions: boolean;
    denyChannel: string;
    approveChannel: string;
    considerChannel: string;
    anonReviews: boolean;
    [key: string]: string | boolean | number | {[key: number]: {
        msg: string; 
        status: "none" | "accepted" | "denied" | "considered" | "custom"; 
        cStatus?: string; 
        suggestor: string; 
        description: string; 
        reason?: string;
        reviewer?: string;
    }}
    constructor(data: Partial<SuggestionsConfig>){
        this.lastSuggestion = data.lastSuggestion ?? 0;
        this.suggestionChannel = data.suggestionChannel ?? "";
        this.suggestions = data.suggestions ?? {};
        this.checkOtherSuggestions = data.checkOtherSuggestions ?? true;
        this.approveChannel = data.approveChannel ?? "";
        this.denyChannel = data.denyChannel ?? "";
        this.considerChannel = data.considerChannel ?? "";
        this.anonReviews = data.anonReviews ?? false;
    }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nameConfigMap: {[key: string]: any} = {
    mod: ModConfig,
    command: CommandConfig,
    module: ModuleConfig,
    logging: LoggingConfig,
    tags: TagConfig,
    welcome: WelcomeConfig,
    starboard: StarboardConfig,
    rank: RankConfig,
    reactionRoles: RRConfig,
    social: SocialConfig,
    autorole: AutoroleConfig,
    goodbye: GoodbyeConfig,
    quotes: QuoteConfig,
    levels: LevelsConfig,
    vtl: VTL,
    suggestions: SuggestionsConfig
};

class MongoGuildManager{
    Hyperion: hyperion;
    constructor(newHype: hyperion){
        this.Hyperion = newHype;
    }

    async createConfig(guild: string): Promise<GuildType>{
        return await this.Hyperion.manager.guild(guild).create();
    }

    async getConfig(guild: string): Promise<GuildType>{
        return await this.Hyperion.manager.guild(guild).getOrCreate();
    }

    async exists(guild: string): Promise<boolean>{
        return await this.Hyperion.manager.guild(guild).exists();
    }

    async getPrefix(guild: string): Promise<string>{
        const doc = await this.getConfig(guild);
        if(!doc?.prefix){return "%";}
        if(doc.prefix === ""){return "%";}
        return doc.prefix;
    }

    async isPro(guild: string): Promise<boolean>{
        const data = await this.getConfig(guild);
        return data?.pro ?? false;
    }

    async setPrefix(guild: string, newPrefix: string): Promise<GuildType>{
        return await this.Hyperion.manager.guild(guild).update({prefix: newPrefix});
    }

    async getMods(guild: string): Promise<Array<string>>{
        const guildConfig = await this.getConfig(guild);
        if(!guildConfig?.mod?.modRoles){return [];}
        const roles = (guildConfig.mod as Types.ModConfig)?.modRoles;
        if(!roles){return [];}
        return roles;
    }

    validateModuleState(state: boolean, module: string, modules: Collection<Module>): false | ModuleConfig{
        if(module === "reactionRoles"){module = "reactionroles";}
        const mod: undefined | Module = modules.get(module);
        if(mod === undefined){return false;}
        if(mod.private){return false;}
        if(!state && mod.alwaysEnabled){return false;}
        return new ModuleConfig({enabled: state}, mod.defaultStatus);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateCommandState(data: any, command: string, commands: Collection<Command>): string | CommandConfig{
        const cmd: Command | undefined = commands.get(command);
        if(!cmd){return "Invalid command";}
        const cmdConfig = new CommandConfig(data);
        if(!cmdConfig.enabled && cmd.alwaysEnabled){return "This command can not be disabled";}
        if(cmd.internal || cmd.dev || cmd.admin || cmd.support){return "This command is private and can not be configured per server";}
        return new CommandConfig(data);
    }

    async updateModuleStates(guild: string, newMod: string, newState: boolean, modules: Collection<Module>): Promise<GuildType | undefined>{
        const guilddata = await this.getConfig(guild);
        if(!guilddata?.modules){return;}
        const validated = this.validateModuleState(newState, newMod, modules);
        if(validated === false){return;}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temp: any = {};
        temp[newMod] = validated;
        const merged = this.merge(guilddata.modules, temp);
        guilddata.modules = merged;
        return await this.Hyperion.manager.guild(guild).update(guilddata);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateCommands(guild: string, newCmd: string, data: any, commands: Collection<Command>): Promise<string | GuildType>{
        const guilddata = await this.getConfig(guild);
        if(!guilddata?.commands){throw new Error("An error occured");}
        const validated = this.validateCommandState(this.merge(guilddata.commands[newCmd] ?? {}, data), newCmd, commands);
        if(typeof(validated) === "string"){throw new Error(validated);}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temp: any = {};
        temp[newCmd] = validated;
        const merged = this.merge(guilddata.commands, temp);
        guilddata.commands = merged;
        return await this.Hyperion.manager.guild(guild).update(guilddata);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateModuleConfig(guild: string, mod: string, data: any): Promise<string | GuildType>{
        if(mod === "reactionroles"){mod = "reactionRoles";}
        if(!Object.getOwnPropertyNames(nameConfigMap).includes(mod)){
            throw new Error("No matching module found");
        }
        let guilddata = await this.getConfig(guild);
        if(!guilddata){guilddata = await this.createConfig(guild);}
        if(!guilddata?.[mod]){guilddata[mod] = {};}
        const merged = this.merge(guilddata?.[mod], data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validated: any = new nameConfigMap[mod](merged);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = {};
        update[mod] = validated;
        return await this.Hyperion.manager.guild(guild).update(update);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async update(guild: string, update: any): Promise<GuildType>{
        return await this.Hyperion.manager.guild(guild).update(update);
    }

    async getCommandState(guild: string, command: string): Promise<CommandConfig>{
        const config = await this.getConfig(guild);
        return new CommandConfig(config?.commands[command] ?? {});
    }

    async getModuleConfig<T>(guild: string, module: string): Promise<T>{
        if(module === "reactionroles"){module = "reactionRoles";}
        const data = await this.getConfig(guild);
        if(!data){throw new Error("Could not get guild config");}
        const config = nameConfigMap[module];
        if(!config){throw new Error("No config for that module");}
        return new config(data[module] ?? {});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merge(oldData: any, newData: any): any{
        const newProps: Array<string> = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop: string) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }

    fillConfig(guildConfig: GuildType): GuildType{
        return this.Hyperion.configManagers.get("guild")?.format(guildConfig) as GuildType;
    }
}





export {MongoGuildManager as manager};
