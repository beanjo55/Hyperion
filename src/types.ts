/* eslint-disable no-unused-vars */
import {Client, Collection, Guild, Message, Emoji, TextChannel, Embed, Member, User} from "eris";
import {Module} from "./Core/Structures/Module";
import {Command} from "./Core/Structures/Command";
import mongoose from "mongoose";


export interface HyperionGuild extends Guild{
    fetched?: boolean;
    guildconf?: any;
}

export interface CoreOptions{
    build: string;
    sentryDSN: string;
    modlist: Array<string>;
    devPrefix: string;
    adminPrefix: string;
    version: string;
    defaultColor: number;
    defaultLogLevel: number;
    circleCIToken: string;
}

export interface HyperionInterface {
    client: Client;
    build: string;
    modules: Collection<Module>;
    sentry: any;
    commands: Collection<Command>;
    logger: any;
    bevents: any;
    devPrefix: string;
    modlist: Array<string>;
    version: string;
    adminPrefix: string;
    defaultColor: number;
    mongoOptions: mongoose.ConnectionOptions;
    models: any;
    db: mongoose.Connection;
    global: any;
    handler?: any;
    logLevel: number;
    managers: any;
    stars: any;
    utils: any;
    circleCIToken: string;
}

export interface CommandConfig{
    allowedRoles: Array<string>;
    disabledRoles: Array<string>;
    allowedChannels: Array<string>;
    disabledChannels: Array<string>;
    enabled: Boolean;
    subcommands?: Array<CommandConfig>;
    name?: string;
}

export interface ModuleConfig{
    enabled: Boolean;
}

export interface ModConfig{
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    deleteAfter: Number;
    modLogChannel: string;
    requireReason: Boolean;
    requireMuteTime: Boolean;
    deleteOnBan: Boolean;
    deleteCommand: Boolean;
}

export interface StarboardConfig{
    starChannel: string;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    selfStar: Boolean;
    customStar: string;
    starCount: number;
}

export interface LogEvent {
    enabled: Boolean;
    channel: string;
}

export interface LoggingConfig{
    logChannel: string;
    ghostReactTime: Number;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    specifyChannels: Boolean;

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
    memberRoleRemove: LogEvent;
    memberNicknameChange: LogEvent;
    voiceJoin: LogEvent;
    voiceSwitch: LogEvent;
    voiceLeave: LogEvent;
    guildUpdate: LogEvent;
    webhookUpdate: LogEvent;
    ghostReact: LogEvent;
}

export interface WelcomeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: Boolean;
}

export interface tag {
    name: string;
    author: string;
    date: number;
    editauthor?: string;
    editdate?: number;
    uses: number;
    content: string; 
}

export interface TagConfig{
    allowedEditRoles: Array<string>;
    limitEdit: Boolean;
    delete: Boolean;
    tags: Array<tag>;
}

export interface RankConfig{
    limitOne: Boolean;
    limitOnePerGroup: Boolean;
    ranks: any;
    rankGroups: any;
}

export interface RRConfig{
    limitOne: Boolean;
    limitOnePerGroup: Boolean;
    rr: any;
    rrGroups: any;
}

export interface AutoroleConfig{
    autoroles: any;
    removePrevious: Boolean
}

export interface SocialConfig{
    ignoredChannels: Array<string>;
    levelupChannel: string;
}

export interface Status{
    code: Number;
    error?: Error | string;
    payload?: any;
}

export interface HandlerConfig{
    type: string;
    logLevel: number;
    priority: number;
}

export interface GuildConfig {
    guild: string;
    prefix: string;
    updatedAt: number;
    modules: any;
    reactionRoles: RRConfig;
    autoroles: AutoroleConfig;
    ranks: RankConfig;
    tags: TagConfig;
    starboard: StarboardConfig;
    logging: LoggingConfig;
    welcome: WelcomeConfig;
    mod: ModConfig;
    commands: any;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    ignoredUsers: Array<string>;
    cantRunMessage: boolean;
    botMissingPermsMessages: boolean;
}

export interface AckInterface{
    contrib: boolean;
    friend: boolean;
    staff: boolean;
    support: boolean;
    admin: boolean;
    developer: boolean;
    owner: boolean;
    custom: string;
}

export interface CommandContext{
    msg: Message;
    channel: TextChannel;
    guild: Guild;
    guildConfig: GuildConfig;
    member: Member;
    user: User;
    command: Command;
    module: Module;
    content: string;
    args: Array<string>;
    dev: boolean;
    admin: boolean;
    override?: boolean;
    permLevel?: number;
    respond?: string;
    silent?: boolean;
    delete?: boolean;
}

export interface UserConfig{
    user: string;
    level: number,
    exp: number;
    money: number;
    rep: number;
    repGiven: number;
    lastRepTime: number;
    lastDailyTime: number;
    lastSallyGame: number;
    socialPings: boolean;
    color?: string;
    friends: Array<string>;
    partner?: string;
    data: any;
    acks: AckInterface;
}