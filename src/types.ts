/* eslint-disable no-unused-vars */
import {Client, Collection, Guild, Message, TextChannel, Embed, Member, User, Role, GuildTextableChannel, VoiceChannel, CategoryChannel} from "eris";
import {Module} from "./Core/Structures/Module";
import {Command} from "./Core/Structures/Command";
import {manager as MGM} from "./Core/DataManagers/MongoGuildManager";
import {manager as MUM} from "./Core/DataManagers/MongoUserManager";
import mongoose from "mongoose";
import IORedis from "ioredis";


export interface HyperionGuild extends Guild{
    fetched?: boolean;
    guildconf?: GuildConfig;
}

export interface CoreOptions{
    build: string;
    sentryDSN: string;
    modlist: Array<string>;
    devPrefix: string;
    adminPrefix: string;
    defaultColor: number;
    defaultLogLevel: number;
    circleCIToken: string;
    init?: boolean;
    dblToken: string;
}

export interface Managers{
    guild: MGM;
    user: MUM;
}

export interface Utils{
    hoistResolver(msg: Message, search: string, members: Collection<Member>): Member | undefined;
    resolveUser(msg: Message, search: string, members: Collection<Member>): Member | undefined;
    getColor(roles: Collection<Role>, guildRoles: Collection<Role>): number;
    sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>): Array<Role>;
    resolveTextChannel(guild: Guild, msg: Message, search: string): GuildTextableChannel | undefined;
    resolveVoicechannel(guild: Guild, msg: Message, search: string): VoiceChannel | undefined;
    resolveCategory(guild: Guild, msg: Message, search: string): CategoryChannel | undefined;
    input2boolean(input: string): boolean | undefined;
}

export interface HyperionInterface {
    client: Client;
    readonly build: string;
    modules: Collection<Module>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sentry: any;
    commands: Collection<Command>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bevents: any;
    readonly devPrefix: string;
    readonly modlist: Array<string>;
    readonly version: string;
    readonly adminPrefix: string;
    readonly defaultColor: number;
    readonly mongoOptions: mongoose.ConnectionOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly models: any;
    db: mongoose.Connection;
    global: GlobalConfig;
    logLevel: number;
    managers: Managers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stars: any;
    utils: Utils;
    readonly circleCIToken: string;
    redis: IORedis.Redis;
}



export interface CommandConfig{
    allowedRoles: Array<string>;
    disabledRoles: Array<string>;
    allowedChannels: Array<string>;
    disabledChannels: Array<string>;
    enabled: boolean;
    subcommands?: Array<CommandConfig>;
    name?: string;
}

export interface ModuleConfig{
    enabled: boolean;
}

export interface ModConfig{
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    deleteAfter: number;
    modLogChannel: string;
    requireReason: boolean;
    requireMuteTime: boolean;
    deleteOnBan: boolean;
    deleteCommand: boolean;
}

export interface StarboardConfig{
    starChannel: string;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    selfStar: boolean;
    customStar: string;
    starCount: number;
}

export interface LogEvent {
    enabled: boolean;
    channel: string;
    ignoredRoles: Array<string>;
    ignoredChannels: Array<string>;
}

export interface LoggingConfig{
    logChannel: string;
    ghostReactTime: number;
    ignoredChannels: Array<string>;
    ignoredRoles: Array<string>;
    specifyChannels: boolean;
    newAccountAge: number;
    showAvatar: boolean;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

export interface WelcomeConfig{
    messageType: string;
    content: string | Embed;
    channel?: string;
    dm: boolean;
}

export interface Tag {
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
    limitEdit: boolean;
    delete: boolean;
    tags: Array<Tag>;
}

export interface RankConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ranks: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rankGroups: any;
}

export interface RRConfig{
    limitOne: boolean;
    limitOnePerGroup: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rr: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rrGroups: any;
}

export interface AutoroleConfig{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoroles: any;
    removePrevious: boolean;
}

export interface SocialConfig{
    ignoredChannels: Array<string>;
    levelupChannel: string;
}

export interface Status{
    code: number;
    error?: Error | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: any;
    reactionRoles: RRConfig;
    autoroles: AutoroleConfig;
    ranks: RankConfig;
    tags: TagConfig;
    starboard: StarboardConfig;
    logging: LoggingConfig;
    welcome: WelcomeConfig;
    mod: ModConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    level: number;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    acks: AckInterface;
    bio: string;
}

export enum ConfigOp{
    show = 0,
    view = 0,
    get = 0,
    set = 1,
    add = 2,
    remove = 3,
    del = 3,
    delete = 3,
    clear = 4,
    reset = 4
}
export interface ConfigKey{
    parent: string;
    id: string;
    ops: Array<ConfigOp>;
    description: string;
    friendlyName: string;
    dataType: string;
    array: boolean;
    default: unknown;
}

export interface GlobalConfig{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sallyGameConsts: any;
    gDisabledMods: Array<string>;
    gDisabledCommands: Array<string>;
    blacklist: Array<string>;
    globalCooldown: number;
    globalDisabledLogEvents: Array<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}