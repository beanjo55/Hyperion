class ShardResumeHandler{
    constructor(){
        this.name = "shardResume";
    }
    async handle(shardID){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} resumed`);
    }
}
exports.event = new ShardResumeHandler;