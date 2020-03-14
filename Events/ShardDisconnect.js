class ShardDisconnectHandler{
    constructor(){
        this.name = "shardDisconnect";
    }
    async handle(err, shardID){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} disconnected, error: ${err}`);
    }
}
exports.event = new ShardDisconnectHandler;