/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-mixed-spaces-and-tabs */
import { NodeMessage, Client, ClientSocket, SendOptions } from "veza";
import { IPCEvents, IPCError, IPCResult, IPCEvent } from "../../types";
import {EventEmitter} from "events";
import { BaseServiceWorker } from "./BaseServiceWorker";


function makeError(data: any): Error {
    const error = new Error(data.message);
    error.name = data.name;
    error.stack = data.stack;

    return error;
}

export class ServiceWorkerIPC extends EventEmitter {
	[key: string]: any; // Used to make code like "this['ready']" work
	private clientSocket?: ClientSocket;
	private client: Client;

	constructor(public worker: BaseServiceWorker, public ipcSocket: string | number) {
	    super();

	    this.client = new Client("Hyperion:Service:" + this.worker.name)
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

	public send(data: IPCEvent, options: SendOptions = {}): Promise<unknown> {
	    if (typeof data !== "object" || data.op === undefined)
	        throw new Error("Message data not an object, or no op code was specified");

	    if (options.receptive === undefined)
	        options.receptive = false;

	    return this.server.send(data, options);
	}

	public async sendMasterEval(script: string | Function): Promise<unknown[]> {
	    script = typeof script === "function" ? `(${script})(this)` : script;

	    const { success, d } = await this.server.send({ op: IPCEvents.EVAL, d: script }) as IPCResult;
	    if (!success)
	        throw makeError(d as IPCError);

	    return d as unknown[];
	}

	public async fetchUser(query: string, clusterId?: number): Promise<unknown> {
	    const result = await this.server.send({ op: IPCEvents.FETCH_USER, d: { query, clusterId } }) as IPCResult;

	    if (!result.success)
	        throw makeError(result.d as IPCError);

	    return result.d;
	}

	public async fetchChannel(id: string, clusterId?: number): Promise<unknown> {
	    const result = await this.server.send({ op: IPCEvents.FETCH_CHANNEL, d: { id, clusterId } }) as IPCResult;

	    if (!result.success)
	        throw makeError(result.d as IPCError);

	    return result.d;
	}

	public async fetchGuild(id: string, clusterId?: number): Promise<unknown> {
	    const result = await this.server.send({ op: IPCEvents.FETCH_GUILD, d: { id, clusterId } }) as IPCResult;

	    if (!result.success)
	        throw makeError(result.d as IPCError);

	    return result.d;
	}

	private handleMessage(message: NodeMessage): void {
	    this["_" + message.data.op](message, message.data.d);
	}

	private async ["_" + IPCEvents.SERVICE_EVAL](message: NodeMessage, data: string): Promise<void> {
	    try {
	        const result = await this.worker.eval(data);
	        return message.reply({ success: true, d: result });
	    } catch (error) {
	        return message.reply({ success: false, d: { name: error.name, message: error.message, stack: error.stack } });
	    }
	}

	private async ["_" + IPCEvents.SHUTDOWN](): Promise<void> {
	    if (this.worker.shutdown)
	        await this.worker.shutdown();

	    await this.disconnect();

	    process.exit(0);
	}

	private async ["_" + IPCEvents.SERVICE_COMMAND](message: NodeMessage, data: string): Promise<void> {
	    try {
	        if (!message.receptive)
	            this.worker.handleCommand(data, false);

	        const result = await this.worker.handleCommand(data, true);
	        return message.reply(result);
	    } catch (error) {
	        return message.reply({ success: false, d: { name: error.name, message: error.message, stack: error.stack } });
	    }
	}

	private ["_" + IPCEvents.GET_STATS](message: NodeMessage): void {
	    return message.reply({
	        success: true, d: {
	            source: this.worker.name,
	            stats: {
	                memory: process.memoryUsage(),
	                cpu: process.cpuUsage()
	            }
	        }
	    });
	}
}