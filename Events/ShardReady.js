class ShardReadyHandler{
    constructor(){
        this.name = "shardReady";
        this.handler = this.handle;
    }
    async handle(shardID){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} ready!`);
    }
}
exports.event = new ShardReadyHandler;