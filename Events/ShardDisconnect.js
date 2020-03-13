class ShardDisconnectHandler{
    constructor(){
        this.name = "shardDisconnect";
        this.handler = this.handle;
    }
    async handle(err, shardID){

    }
}
exports.event = new ShardDisconnectHandler;