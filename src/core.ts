import {isMaster} from "cluster";
import {CoreOptions} from "./types";
import {default as user} from "./MongoDB/User";
import {default as global} from "./MongoDB/Global";
import {default as fs} from "fs";
import {Admiral as Fleet, Options} from "./Core/Sharding/Admiral";
import {inspect} from "util";
import {logger} from "./Core/Structures/Logger";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");
type logTypes = "error" | "warn" | "fatal" | "debug" | "success" | "info"
function logWrapper(input: string, name: logTypes): void{
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
        clientOptions: config.clientOptions
    };
    const Admiral = new Fleet(options);
    if (isMaster) {
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