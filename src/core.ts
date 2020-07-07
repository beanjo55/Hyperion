import {isMaster} from "cluster";
import {CoreOptions} from "./types";
import {default as user} from "./MongoDB/User";
import {default as global} from "./MongoDB/Global";
import {default as fs} from "fs";
import {Admiral as Fleet, Options} from "./Core/Sharding/Admiral";
import {inspect} from "util";
import {logger} from "./Core/Structures/Logger";
import {Client} from "eris";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");
type logTypes = "error" | "warn" | "fatal" | "debug" | "success" | "info"
function logWrapper(input: string, name: logTypes): void{
    if(name === "error" && (input.includes("1001") || input.includes("1006"))){return;}
    if(input.startsWith("Admiral |")){
        input = input.slice(9);
    }
    logger[name]("Harbringer", input);
}

async function start(): Promise<void>{
    if((config.coreOptions as CoreOptions).init !== undefined && (config.coreOptions as CoreOptions).init === true){
        await global.create({});
        await user.create({user: "253233185800847361", acks: {developer: true}});
        console.log("Generated new global config. Dont forget to change \"init\" to false. Exiting");
        process.exit(0);
    }
    const options: Options = {
        path: __dirname + "/main.js",
        token: config.token,
        clusters: 1,
        shards: 1,
        clientOptions: config.erisOptions,
        whatToLog: {blacklist: ["stats_update"]}
    };

    const Admiral = new Fleet(options);
    if (isMaster) {
        const client = new Client(config.token, config.erisOptions);
        client.executeWebhook("730091355128332298", "oMTzbtRawONStiMWL3pz8y7SAkhajPIqbPe_z9Mxpc1-KBXySCf6AUVgb4NE5soxjKGW", {
            embeds: [
                {
                    title: "Harbringer Online",
                    timestamp: new Date,
                    description: `Starting ${options.clusters} clusters with ${options.shards} shards`,
                    color: config.coreOptions.defaultColor,
                    footer: {text: "Assuming direct control"}
                }
            ]
        });
        // Code to only run for your master process
        Admiral.on("log", m => logWrapper(m, "info"));
        Admiral.on("debug", m => logWrapper(m, "debug"));
        Admiral.on("warn", m => logWrapper(m, "warn"));
        Admiral.on("error", m => logWrapper(inspect(m), "error"));
    
        // Logs stats when they arrive
        //Admiral.on("stats", m => console.log(m));
    }


}
if(isMaster){
    fs.readFile(`${__dirname}/v2.txt`, "utf8", function (error, data) {
        console.log(data);
        start();
    });
}else{
    start();
}