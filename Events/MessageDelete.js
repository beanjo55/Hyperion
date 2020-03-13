class MessageDeleteHandler{
    constructor(){
        this.name = "messageDelete";
        this.handler = this.handle;
    }
    async handle(msg){

    }
}
exports.event = new MessageDeleteHandler;