/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-mixed-spaces-and-tabs */

import { NodeMessage, Client, ClientSocket, SendOptions } from "veza";
import {BaseClusterWorker} from "./BaseClusterWorker";
import {EventEmitter} from "events";
import {IPCEvent, IPCError, IPCEvents, IPCResult, IPCEvalResults} from "../../types";


function makeError(data: any): Error {
    const error = new Error(data.message);
    error.name = data.name;
    error.stack = data.stack;

    return error;
}

export class ClusterWorkerIPC extends EventEmitter {
	[key: string]: any; // Used to make code like "this['ready']" work
	private clientSocket?: ClientSocket;
	private client: Client;

	constructor(public worker: BaseClusterWorker, public ipcSocket: string | number) {
	    super();

	    this.client = new Client("Hyperion:Cluster:" + this.worker.id)
	        .on("error", error => this.emit("error", error))
	        .on("disconnect", client => this.emit("warn", "Disconnected from " + client.name))
	        .on("ready", client => this.emit("debug", "Connected to " + client.name))
	        .on("message", this.handleMessage.bind(this));
	}

	public async init(): Promise<void> {
	    this.clientSocket = await this.client.connectTo(String(this.ipcSocket));
	}

	public disconnect(): boolean {
	    return this.server.disconnect();
	}

	public get server(): ClientSocket {
	    return this.clientSocket!;
	}

	public send(data: IPCEvent, options: SendOptions = { }): Promise<unknown> {
	    if (typeof data !== "object" || data.op === undefined)
	        throw new Error("Message data not an object, or no op code was specified");

	    if (options.receptive === undefined)
	        options.receptive = false;

	    return this.server.send(data, options);
	}

	public getStats(): Promise<unknown>{
	    return this.server.send({op: IPCEvents.GET_STATS});
	}

	/** Run an eval on the master process sharding manager */
	public async sendMasterEval(script: string | Function): Promise<unknown[]> {
	    script = typeof script === "function" ? `(${script})(this)` : script;

	    const { success, d } = await this.server.send({ op: IPCEvents.EVAL, d: script }) as IPCResult;
	    if (!success)
	        throw makeError(d as IPCError);

	    return d as unknown[];
	}

	/** Run an eval on a specific service */
	public async sendServiceEval(script: string | Function, serviceName: string): Promise<any> {
	    script = typeof script === "function" ? `(${script})(this)` : script;

	    const { success, d } = await this.server.send({ op: IPCEvents.SERVICE_EVAL, d: { serviceName, script } }) as IPCResult;
	    if (!success)
	        throw makeError(d as IPCError);

	    return d as any;
	}

	/** Run an eval on all services */
	public async broadcastServiceEval(script: string | Function): Promise<IPCEvalResults> {
	    script = typeof script === "function" ? `(${script})(this)` : script;

	    const { success, d } = await this.server.send({ op: IPCEvents.SERVICE_EVAL, d: { script } }) as IPCResult;
	    if (!success)
	        throw makeError(d as IPCError);

	    return d as IPCEvalResults;
	}

	/** Send a command to a service */
	public async sendCommand(serviceName: string, data: any, options: SendOptions = { }): Promise<unknown[] | undefined>{
	    if (typeof data !== "object")
	        throw new Error("Message data not an object");

	    if (options.receptive === undefined)
	        options.receptive = false;

	    data.serviceName = serviceName;

	    const { success, d } = await this.server.send({ op: IPCEvents.SERVICE_COMMAND, d: data }, options) as IPCResult;
	    if (!options.receptive)
	        return;

	    if (!success)
	        throw makeError(d);

	    return d as unknown[];
	}

	public async fetchUser(query: string, clusterId?: number): Promise<unknown> {
	    const { success, d } = await this.server.send({ op: IPCEvents.FETCH_USER, d: { query, clusterId } }) as IPCResult;

	    if (!success)
	        throw makeError(d as IPCError);

	    return d;
	}

	public async fetchChannel(id: string, clusterId?: number): Promise<unknown> {
	    const { success, d } = await this.server.send({ op: IPCEvents.FETCH_CHANNEL, d: { id, clusterId } }) as IPCResult;

	    if (!success)
	        throw makeError(d as IPCError);

	    return d;
	}

	public async fetchGuild(id: string, clusterId?: number): Promise<unknown> {
	    const { success, d } = await this.server.send({ op: IPCEvents.FETCH_GUILD, d: { id, clusterId } }) as IPCResult;

	    if (!success)
	        throw makeError(d as IPCError);

	    return d;
	}

	private handleMessage(message: NodeMessage): void {
	    this["_" + message.data.op](message, message.data.d);
	}

	private async ["_" + IPCEvents.EVAL](message: NodeMessage, data: string): Promise<void> {
	    try {
	        const result = await this.worker.eval(data);
	        return message.reply({ success: true, d: result });
	    } catch (error) {
	        return message.reply({ success: false, d: { name: error.name, message: error.message, stack: error.stack } });
	    }
	}

	private async ["_" + IPCEvents.SHUTDOWN](): Promise<void> {
	    await this.worker.shutdown();
	    await this.disconnect();

	    process.exit(0);
	}

	private ["_" + IPCEvents.FETCH_USER](message: NodeMessage, data: any): void {
	    const result = this.worker.getUser(data.query)?.toJSON() || null;
	    return message.reply({ success: true, d: { found: result !== null, result } });
	}

	private ["_" + IPCEvents.FETCH_CHANNEL](message: NodeMessage, data: any): void {
	    const result = this.worker.getChannel(data.query)?.toJSON() || null;
	    return message.reply({ success: true, d: { found: result !== null, result } });
	}

	private ["_" + IPCEvents.FETCH_GUILD](message: NodeMessage, data: any): void {
	    const result = this.worker.getGuild(data.query)?.toJSON() || null;
	    return message.reply({ success: true, d: { found: result !== null, result } });
	}

	private ["_" + IPCEvents.GET_STATS](message: NodeMessage): void {
	    return message.reply({ success: true, d: {
	        source: this.worker.id,
	        stats: {
	            memory: process.memoryUsage(),
	            cpu: process.cpuUsage(),
	            discord: {
	                guilds: this.worker.client.guilds.size,
	                latencies: this.worker.client.shards.map(shard => shard.latency),
	                uptime: this.worker.client.uptime,
	                users: this.worker.client.users.size
	            }
	        }
	    } });
	}
}