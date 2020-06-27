/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import * as Eris from "eris";
import {worker} from "cluster";
import {BaseClusterWorker} from "./BaseClusterWorker";
import {inspect} from "util";
import * as Admiral from "../Sharding/Admiral";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../../../config.json");

export class Cluster {
	firstShardID!: number;
	lastShardID!: number;
	path!: string;
	clusterID!: number;
	clusterCount!: number;
	shardCount!: number;
	shards!: number;
	clientOptions!: Eris.ClientOptions;
	whatToLog!: string[];
	client!: Eris.Client;
	private token!: string;
	app?: BaseClusterWorker;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	App!: any;
	shutdown?: boolean;
	private startingStatus?: Admiral.StartingStatus;
	loaded = false;

	constructor() {
	    console.log = (str: unknown) => {if (process.send) process.send({op: "log", msg: str, source: "Cluster " + this.clusterID});};
	    console.debug = (str: unknown) => {if (process.send) process.send({op: "debug", msg: str, source: "Cluster " + this.clusterID});};
	    console.error = (str: unknown) => {if (process.send) process.send({op: "error", msg: str, source: "Cluster " + this.clusterID});};
	    console.warn = (str: unknown) => {if (process.send) process.send({op: "warn", msg: str, source: "Cluster " + this.clusterID});};

	    //Spawns
	    process.on("uncaughtException", (err: Error) => {
	        if (process.send) process.send({op: "error", msg: inspect(err)});
	    });

	    process.on("unhandledRejection", (reason, promise) => {
	        if (process.send) process.send({op: "error", msg: "Unhandled Rejection at: " + inspect(promise) + " reason: " + reason});
	    });

	    if (process.send) process.send({op: "launched"});
		
	    process.on("message", async message => {
	        if (message.op) {
	            switch (message.op) {
	            case "connect": {
	                this.firstShardID = message.firstShardID;
	                this.lastShardID = message.lastShardID;
	                this.path = message.path;
	                this.clusterID = message.clusterID;
	                this.clusterCount = message.clusterCount;
	                this.shardCount = message.shardCount;
	                this.shards = (this.lastShardID - this.firstShardID) + 1;
	                this.clientOptions = message.clientOptions;
	                this.token = message.token;
	                this.whatToLog = message.whatToLog;
	                if (message.startingStatus) this.startingStatus = message.startingStatus;

	                if (this.shards < 0) return;
	                this.connect();

	                break;
	            }
	            case "fetchUser": {
	                if (!this.client) return;
	                const user = this.client.users.get(message.id);
	                if (user) {
	                    if (process.send) process.send({op: "return", value: user, UUID: message.UUID});
	                } else {
	                    if (process.send) process.send({op: "return", value: {id: message.id, noValue: true}, UUID: message.UUID});
	                }
						
	                break;
	            }
	            case "fetchChannel": {
	                if (!this.client) return;
	                const channel = this.client.getChannel(message.id);
	                if (channel) {
	                    if (process.send) process.send({op: "return", value: channel, UUID: message.UUID});
	                } else {
	                    if (process.send) process.send({op: "return", value: {id: message.id, noValue: true}, UUID: message.UUID});
	                }

	                break;
	            }
	            case "fetchGuild": {
	                if (!this.client) return;
	                const guild = this.client.guilds.get(message.id);
	                if (guild) {
	                    if (process.send) process.send({op: "return", value: guild, UUID: message.UUID});
	                } else {
	                    if (process.send) process.send({op: "return", value: {id: message.id, noValue: true}, UUID: message.UUID});
	                }

	                break;
	            }
	            case "fetchMember": {
	                if (!this.client) return;
	                const messageParsed = JSON.parse(message.id);

	                const guild = this.client.guilds.get(messageParsed.guildID);
	                if (guild) {
	                    const member = guild.members.get(messageParsed.memberID);
	                    if (member) {
	                        const clean = member.toJSON();
	                        clean.id = message.id;
	                        if (process.send) process.send({op: "return", value: clean, UUID: message.UUID});
	                    } else {
	                        if (process.send) process.send({op: "return", value: {id: message.id, noValue: true}, UUID: message.UUID});
	                    }
	                } else {
	                    if (process.send) process.send({op: "return", value: {id: message.id, noValue: true}, UUID: message.UUID});
	                }

	                break;
	            }
	            case "return": {
	                if (this.app) this.app.ipc.emit(message.id, message.value);
	                break;
	            }
	            case "collectStats": {
	                if (!this.client) return;
	                const shardStats: { id: number; ready: boolean; latency: number; status: string; guilds: number; users: number}[] = [];
	                const getShardUsers = (id: number) => {
	                    let users = 0;
	                    for(const [key, value] of Object.entries(this.client.guildShardMap)) {
	                        const guild = this.client.guilds.find(g => g.id == key);
	                        if (Number(value) == id && guild) users += guild.memberCount;
	                    }
	                    return users;
	                };
	                this.client.shards.forEach(shard => {
	                    shardStats.push({
	                        id: shard.id,
	                        ready: shard.ready,
	                        latency: shard.latency,
	                        status: shard.status,
	                        guilds: Object.values(this.client.guildShardMap).filter(e => e == shard.id).length,
	                        users: getShardUsers(shard.id)
	                    });
	                });
	                if (process.send) process.send({op: "collectStats", stats: {
	                    guilds: this.client.guilds.size,
	                    users: this.client.users.size,
	                    uptime: this.client.uptime,
	                    voice: this.client.voiceConnections.size,
	                    largeGuilds: this.client.guilds.filter(g => g.large).length,
	                    shardStats: shardStats,
	                    ram: process.memoryUsage().rss / 1e6
	                }});

	                break;
	            }
	            case "shutdown": {
	                this.shutdown = true;
	                if (this.app) {
	                    if (this.app.shutdown) {
	                        let safe = false;
	                        // Ask app to shutdown
	                        this.app.shutdown(() => {
	                            safe = true;
	                            this.client.disconnect({reconnect: false});
	                            if (process.send) process.send({op: "shutdown"});
	                        });
	                        if (message.killTimeout > 0) {
	                            setTimeout(() => {
	                                if (!safe) {
	                                    console.error(`Cluster ${this.clusterID} took too long to shutdown. Performing shutdown anyway.`);
										
	                                    this.client.disconnect({reconnect: false});
	                                    if (process.send) process.send({op: "shutdown"});
	                                }
	                            }, message.killTimeout);
	                        }
	                    } else {
	                        this.client.disconnect({reconnect: false});
	                        if (process.send) process.send({op: "shutdown"});
	                    }
	                } else {
	                    this.client.disconnect({reconnect: false});
	                    if (process.send) process.send({op: "shutdown"});
	                }

	                break;
	            }
	            case "loadCode": {
	                this.loadCode();

	                break;
	            }
	            }
	        }
	    });
	}

	private async connect() {
	    if (this.whatToLog.includes("cluster_start")) console.log(`Connecting with ${this.shards} shard(s)`);

	    const options = Object.assign(this.clientOptions, {autoreconnect: true, firstShardID: this.firstShardID, lastShardID: this.lastShardID, maxShards: this.shardCount});

	    let App = (await import(this.path));

	    let client;
	    if (App.Eris) {
	        client = new App.Eris.Client(this.token, options);
	        App = App.BotWorker;
	    } else {
	        client = new Eris.Client(this.token, options);
	        if (App.BotWorker) {
	            App = App.BotWorker;
	        } else {
	            App = App.default ? App.default : App;
	        }
	    }
	    if(!this.app){this.App = App;}
	    this.client = client;
	    this.loadCode();

	    client.on("connect", (id: number) => {
	        if (this.whatToLog.includes("shard_connect")) console.log(`Shard ${id} connected!`);
	    });

	    client.on("shardDisconnect", (err: Error, id: number) => {
	        if (!this.shutdown) if (this.whatToLog.includes("shard_disconnect")) console.log(`Shard ${id} disconnected with error: ${inspect(err)}`);
	    });


	    client.on("shardReady", (id: number) => {
	        if (this.whatToLog.includes("shard_ready")) console.log(`Shard ${id} is ready!`);
	    });

	    client.on("shardResume", (id: number) => {
	        if (this.whatToLog.includes("shard_resume")) console.log(`Shard ${id} has resumed!`);
	    });

	    client.on("warn", (message: string, id: number) => {
	        if (process.send) process.send({op: "warn", msg: message, source: `Cluster ${this.clusterID}, Shard ${id}`});
	    });

	    client.on("error", (error: Error, id: number) => {
	        if (process.send) process.send({op: "error", msg: inspect(error), source: `Cluster ${this.clusterID}, Shard ${id}`});
	    });

	    client.on("ready", () => {
	        if (this.whatToLog.includes("cluster_ready")) console.log(`Shards ${this.firstShardID} - ${this.lastShardID} are ready!`);
	    });

	    client.once("ready", () => {
	        
	        if (process.send) process.send({op: "connected"});
	    });
		
		
	    //this.client.connect();
	    // Connects the bot
	    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	    //@ts-ignore
	    //this.launch();
	}

	
	private async loadCode() {
	    //let App = (await import(this.path)).default;
	    //App = App.default ? App.default : App;
	    if(this.loaded){return;}
	    this.app = new this.App({client: this.client, clusterID: this.clusterID, workerID: worker.id}, config.coreOptions, config.mongoLogin, config.mongoOptions);
	    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	    //@ts-ignore
	    this.app.launch();
	    this.loaded = true;
	}
}