import {isMaster} from "cluster";
import {default as fs} from "fs";
import {Master} from "./harbringer/index";
import {DataApi as da} from "./main";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");

export let DataApi: undefined | da;

async function start(){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const Harbringer = new Master(config.token, "/build/main.js", {
        clusters: config.clusterOptions.clusters,
        firstShardID: 0,
        lastShardID: config.clusterOptions.shards-1,
        shards: config.clusterOptions.shards,
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
if(config.dataApi){
    DataApi = dapi();
}else{
    if(isMaster){
        fs.readFile(`${__dirname}/v3.txt`, "utf8", function (error, data) {
            console.log(data);
            start();
        });
    }else{
        start();
    }
}
function dapi(){
    const dataApi = require("./main.js").DataApi;
    return new dataApi;
}