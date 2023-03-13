import {isMaster} from "cluster";
import {default as fs} from "fs";
import {Master} from "./harbringer/index";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");


async function start(){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const Harbringer = new Master(config.token, "/build/main.js", {
        clusters: 1,
        firstShardID: 0,
        lastShardID: 0,
        stats: true,
        webhooks: {
            cluster: {id: "", token: ""},
            shard: {id: "", token: ""}
        },
        clientOptions: config.erisOptions,
        name: "Hyperion",
        color: config.coreOptions.defaultColor,
        envName: config.coreOptions.build,
        prometheus: true

    });
}
if(isMaster){
    fs.readFile(`${__dirname}/v2.txt`, "utf8", function (error, data) {
        console.log(data);
        start();
    });
}else{
    start();
}