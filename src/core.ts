import {isMaster} from "cluster";
import {ShardManager} from "./Core/Sharding/ShardManager";
import {CoreOptions} from "./types";
import {default as guild} from "./MongoDB/Guild";
import {default as user} from "./MongoDB/User";
import {default as guilduser} from "./MongoDB/Guilduser";
import {default as modlog} from "./MongoDB/Modlog";
import {default as global} from "./MongoDB/Global";
import {default as starModel} from "./MongoDB/Starred";
import {default as fs} from "fs";


const models = {
    user: user,
    guild: guild,
    guilduser: guilduser,
    modlog: modlog,
    global: global,
    starred: starModel
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");



async function start(): Promise<void>{
    if((config.coreOptions as CoreOptions).init !== undefined && (config.coreOptions as CoreOptions).init === true){
        await models.global.create({});
        await models.user.create({user: "253233185800847361", acks: {developer: true}});
        console.log("Generated new global config. Dont forget to change \"init\" to false. Exiting");
        process.exit(0);
    }

    const manager = new ShardManager({
        path: __dirname + "/main.js",
        token: config.token,
        clientOptions: config.erisOptions,
        shardCount: config.clusteringOptions.shards,
        clusterCount: config.clusteringOptions.clusters,
        delay: config.clusteringOptions.delay
    });
    await manager.spawn();
    if (isMaster) {
        // Master process code here
        manager.on("error", error => {
            if(error?.code === 1006){
                console.error(error);
            }}); // Not handling these errors will kill everything when any error is emitted
        manager.on("debug", message => {
            if(message !== "Updating stats"){
                console.log(message);
            }
        });
        manager.on("clusterReady", cluster => console.log(`Cluster ${cluster.id} ready`));
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