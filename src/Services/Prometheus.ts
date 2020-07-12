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
        server.listen(9990);
        this.serviceReady();
    }


}