/* eslint-disable @typescript-eslint/no-unused-vars */
import {default as express} from "express";
import {register, AggregatorRegistry, default as client} from "prom-client";
import {BaseServiceWorker, Setup} from "../Core/Services/BaseServiceWorker";



export default class Prometheus extends BaseServiceWorker{
    constructor(setup: Setup){
        super(setup);
        const server = express();
        this.shutdown = (done): void => {done();};
        server.get("/metrics", async (req, res) => {
            try{
                res.set("Content-Type", register.contentType);
                res.end(await register.metrics());
            }catch(err){
                res.status(500).end(err);
            }
        });
        const ipc = this.ipc;
        const guilds = new client.Gauge({
            name: "Guilds",
            help: "Guild count",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.guilds);
            }
        });
        const largeguilds = new client.Gauge({
            name: "Large_Guilds",
            help: "Large Guild count",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.largeGuilds);
            }
        });
        const totalram = new client.Gauge({
            name: "Total_Ram",
            help: "Total ram used",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.totalRam);
            }
        });
        const users = new client.Gauge({
            name: "Users",
            help: "User count",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.users);
            }
        });
        const exclusive = new client.Gauge({
            name: "Exclusive_Guilds",
            help: "Exclusive Guilds",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.exclusiveGuilds);
            }
        });
        const unavailable = new client.Gauge({
            name: "Unavailable_Guilds",
            help: "Unavailable Guilds",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.unavailableGuilds);
            }
        });
        const clusterram = new client.Gauge({
            name: "Cluster_Ram",
            help: "Cluster Ram",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.clustersRam);
            }
        });
        const serviceram = new client.Gauge({
            name: "Service_Ram",
            help: "Service Ram",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.servicesRam);
            }
        });
        const masterram = new client.Gauge({
            name: "Master_Ram",
            help: "Master Ram",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                this.set(stats.masterRam);
            }
        });
        const averageuptime = new client.Gauge({
            name: "Average_Uptime",
            help: "Average Uptime",
            async collect(): Promise<void>{
                const stats = await ipc.getStats();
                let sum = 0;
                for(const clust of stats.clusters){
                    sum += clust.uptime;
                }
                this.set(sum/stats.clusters.length);
            }
        });
        server.listen(9990);
        this.serviceReady();
    }


}