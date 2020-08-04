
/* eslint-disable no-unused-vars */
import {Collection, Guild, Message, TextChannel, Embed, Member, User, Role, GuildTextableChannel, VoiceChannel, CategoryChannel, GuildChannel} from "eris";
import {Module} from "./Core/Structures/Module";
import {Command} from "./Core/Structures/Command";
import {manager as MGM, QuoteConfig as qc, GoodbyeConfig as gc, LogEvent as le, WelcomeConfig as wc, AutoroleConfig as arc, SocialConfig as sc, RRConfig as rrc, RankConfig as rc, TagConfig as tc, LoggingConfig as lc, StarboardConfig as sbc, ModuleConfig as mc, ModConfig as modc, CommandConfig as cc} from "./Core/DataManagers/MongoGuildManager";
import {manager as MUM} from "./Core/DataManagers/MongoUserManager";
import {manager as MMLM} from "./Core/DataManagers/MongoModLogManager";
import {IGuild} from "./MongoDB/Guild";
import HyperionC from "./main";



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
    fetch: boolean;
}

export interface IManagers{
    guild: MGM;
    user: MUM;
    modlog: MMLM; 
}

export interface IColors{
    red: number;
    blue: number;
    yellow: number;
    green: number;
    orange: number;
    default: number;
}

export interface ILogger{
    debug(name: string, message: string, subprefix?: string): void;
    error(name: string, message: string, subprefix?: string): void;
    fatal(name: string, message: string, subprefix?: string): void;
    info(name: string, message: string, subprefix?: string): void;
    success(name: string, message: string, subprefix?: string): void;
    warn(name: string, message: string, subprefix?: string): void;
}

export interface IUtils{
    hoistResolver(search: string, guild: Guild, members: Collection<Member>): Promise<Member | undefined>;
    resolveUser(search: string, guild: Guild, members: Collection<Member>): Promise<Member | undefined>;
    getColor(roles: Collection<Role>, guildRoles: Collection<Role>): number;
    sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>): Array<Role>;
    resolveTextChannel(guild: Guild, msg: Message, search: string): GuildTextableChannel | undefined;
    resolveVoiceChannel(guild: Guild, msg: Message, search: string): VoiceChannel | undefined;
    resolveCategory(guild: Guild, msg: Message, search: string): CategoryChannel | undefined;
    input2boolean(input: string): boolean | undefined;
    strictResolver(search: string, members: Collection<Member>): Member | undefined;
    banResolver(search: string, members: Collection<Member>, Hyperion: IHyperion): Promise<Member | User | undefined>;
    resolveRole(input: string, roles: Collection<Role>): Role | undefined;
    resolveGuildChannel(guild: Guild, msg: Message, search: string): GuildChannel | undefined;
    parseMessageLink(input: string): null | {guild: string; channel: string; message: string};
    hasUnicodeEmote(input: string): boolean;
    sanitizeQuotes(input: string): string;
    op8(search: string, guild: Guild): Promise<Member | undefined>;
}


export type IHyperion = HyperionC;

export type LogEvent = le;
export interface Tag {
    name: string;
    author: string;
    date: number;
    editauthor?: string;
    editdate?: number;
    uses: number;
    content: string; 
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
export type RRConfig = rrc;
export type AutoroleConfig = arc;
export type RankConfig = rc;
export type TagConfig = tc;
export type StarboardConfig = sbc;
export type SocialConfig = sc;
export type LoggingConfig = lc;
export type WelcomeConfig = wc;
export type ModConfig = modc;
export type ModuleConfig = mc;
export type CommandConfig = cc;
export type GoodbyeConfig = gc;
export type QuoteConfig = qc;
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
    commands: {[key: string]: CommandConfig};
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
    pro: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

export interface ICommandContext<T = Module>{
    msg: Message;
    channel: TextChannel;
    guild: Guild;
    guildConfig: IGuild;
    member: Member;
    user: User;
    command: Command;
    module: T;
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
    validate?(input: string): boolean;
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

export interface IMongoUpdateResult{
    n: number;
    nModified: number;
    ok: number;
    opTime?: Array<unknown>;
    electionId?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operationTime?: any;
    "$clusterTime"?: Array<unknown>;
}

export interface IModerationContext{
    user: string;
    member?: Member;
    moderator: string;
    moderationType: string;
    reason?: string;
    length?: number;
    time: number;
    case?: number;
    auto: boolean;
    role?: string;
    removedRoles?: Array<string>;
    guild: Guild;
    mid?: string;
    stringLength?: string;
    moderationEnd?: boolean;
    autoEnd: boolean;
    logChannel?: string;
}

export type EmbedResponse = {embed: Partial<Embed>};
export type MixedResponse = string | EmbedResponse;
export type CommandResponse = Promise<MixedResponse>;
export type Field = {name: string; value: string; inline: boolean};
export type FieldArray = Array<Field>;

