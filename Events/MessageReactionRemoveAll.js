class MessageReactionRemoveAllHandler{
    constructor(){
        this.name = "messageReactionRemoveAll";
        this.handler = this.handle;
    }
    async handle(msg){

    }
}
exports.event = new MessageReactionRemoveAllHandler;