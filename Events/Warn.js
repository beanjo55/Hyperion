class WarnHandler{
    constructor(){
        this.name = "warn";
        this.handler = this.handle;
    }
    async handle(warnMsg, shardID){

    }
}
exports.event = new WarnHandler;