class ShardResumeHandler{
    constructor(){
        this.name = "shardResume";
        this.handler = this.handle;
    }
    async handle(shardID){

    }
}
exports.event = new ShardResumeHandler;