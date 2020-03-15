class ShardDisconnectHandler{
    constructor(){
        this.name = "shardDisconnect";
    }
    async handle(err, shardID){
        this.logger.warn("Hyperion", "Sharding", `Shard ${shardID} disconnected, error: ${err}`);
    }
}
exports.event = new ShardDisconnectHandler;