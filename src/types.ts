/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable no-unused-vars */
import {Collection, Guild, Message, TextChannel, Embed, Member, User, Role, GuildTextableChannel, VoiceChannel, CategoryChannel, ClientOptions, GuildChannel} from "eris";
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
    hoistResolver(msg: Message, search: string, members: Collection<Member>): Member | undefined;
    resolveUser(msg: Message, search: string, members: Collection<Member>): Member | undefined;
    getColor(roles: Collection<Role>, guildRoles: Collection<Role>): number;
    sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>): Array<Role>;
    resolveTextChannel(guild: Guild, msg: Message, search: string): GuildTextableChannel | undefined;
    resolveVoicechannel(guild: Guild, msg: Message, search: string): VoiceChannel | undefined;
    resolveCategory(guild: Guild, msg: Message, search: string): CategoryChannel | undefined;
    input2boolean(input: string): boolean | undefined;
    strictResolver(search: string, members: Collection<Member>): Member | undefined;
    banResolver(search: string, members: Collection<Member>, Hyperion: IHyperion): Promise<Member | User | undefined>;
    resolveRole(input: string, roles: Collection<Role>): Role | undefined;
    resolveGuildChannel(guild: Guild, msg: Message, search: string): GuildChannel | undefined;
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


export enum IPCEvents {
	EVAL = "eval",
	SERVICE_EVAL = "serviceEval",
	READY = "ready",
	SHARD_READY = "shardReady",
	SHARD_CONNECTED = "shardConnected",
	SHARD_RESUMED = "shardResumed",
	SHARD_DISCONNECTED = "shardDisconnected",
	ERROR = "error",
	SHUTDOWN = "shutdown",
	GET = "get",
	SET = "set",
	FETCH_USER = "fetchUser",
	FETCH_GUILD = "fetchGuild",
	FETCH_CHANNEL = "fetchChannel",
	SERVICE_COMMAND = "serviceCommand",
	GET_STATS = "getStats"
}

export enum SharderEvents {
	SERVICE_SPAWN = "serviceSpawn",
	SERVICE_READY = "serviceReady",
	CLUSTER_SPAWN = "clusterSpawn",
	CLUSTER_READY = "clusterReady",
	SHARD_CONNECTED = "shardConnected",
	SHARD_READY = "shardReady",
	SHARD_RESUMED = "shardResumed",
	SHARD_DISCONNECT = "shardDisconnect",
	STATS_UPDATED = "statsUpdated",
	DEBUG = "debug",
	ERROR = "error"
}

export interface IPCEvent {
	op: IPCEvents;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	d?: any;
}

export interface IPCResult {
	success: boolean;
	d: unknown;
}

export interface IPCError {
	name: string;
	message: string;
	stack?: string;
}

export interface IPCEvalResults {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	results: any[];
	errors: IPCError[];
}

export interface ProcessStats {
	/** https://nodejs.org/api/process.html#process_process_memoryusage */
	memory: NodeJS.MemoryUsage;
	/** https://nodejs.org/api/process.html#process_process_cpuusage_previousvalue */
	cpu: NodeJS.CpuUsage;
	discord?: {
		guilds: number;
		/** The current latency between the shard and Discord, in milliseconds */
		latencies: number[];
		/** How long in milliseconds the bot has been up for */
        uptime: number;
        users: number;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export interface HyperionStats {
	clusters: Record<number, ProcessStats>;
	services: Record<string, ProcessStats>;
	manager: ProcessStats;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export interface ShardOptions {
	first: number;
	last: number;
	total: number;
}

export interface IClusterOptions {
	id: number;
	shards: ShardOptions;
}

export interface ServiceOptions {
	name: string;
	/** How many milliseconds to wait for the service worker to be ready */
	timeout?: number;
}

export interface ISharderOptions {
	/** Path to the js file for clusters to run */
	path: string;
	/** Discord bot token */
	token: string;
	/** Number of guilds each shard should have (at initial sharding) (Only used if shardCount is set to 'auto') */
	guildsPerShard?: number;
	/** Number of shards to create */
	shardCount?: number | "auto";
	/** Maximum number of clusters to create */
	clusterCount?: number;
	/** Options to pass to the Eris client constructor */
	clientOptions?: ClientOptions;
	/** How long to wait for a cluster to connect before throwing an error, multiplied by the number of thousands of guilds */
	timeout?: number;
	/** An array of arguments to pass to the cluster node processes */
	nodeArgs?: string[];
	/** The socket/port for IPC to run on */
	ipcSocket?: string | number;
	/** How often to update stats (in milliseconds) */
    statsInterval?: number;
    delay: number;
}

export interface ISessionObject {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
        reset_after: number;
        max_concurency: number;
	};
}

export interface IClusterShardInfo {
	/** First 0-indexed shard for this cluster */
	first: number;
	/** Last 0-indexed shard for this cluster */
	last: number;
	/** Total number of shards across all clusters */
	total: number;
}

export interface IClusteringOptions{
    clusters: number;
    shards: number | "auto";
    delay: number;
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
}

export type EmbedResponse = {embed: Partial<Embed>};
export type MixedResponse = string | EmbedResponse;
export type CommandResponse = Promise<MixedResponse>;
export type Field = {name: string; value: string; inline: boolean};
export type FieldArray = Array<Field>;

