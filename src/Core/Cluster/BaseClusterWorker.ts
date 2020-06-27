/* eslint-disable no-mixed-spaces-and-tabs */
import {IPC} from "../Utils/Fleet/IPC";
import {Client} from "eris";

export interface Setup {
	client: Client;
	clusterID: number;
	workerID: number;
}

export class BaseClusterWorker {
	public client: Client;
	public clusterID: number;
	public workerID: number;
	public ipc: IPC;
	/** Function called for graceful shutdown of the cluster */
	public shutdown?: (done: () => void) => void;

	public constructor(setup: Setup) {
	    this.client = setup.client;
	    this.clusterID = setup.clusterID;
	    this.workerID = setup.workerID;
	    this.ipc = new IPC();
	}
}