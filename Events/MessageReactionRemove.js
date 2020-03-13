class MessageReactionRemoveHandler{
    constructor(){
        this.name = "messageReactionRemove";
        this.handler = this.handle;
    }
    async handle(msg, emote, userID){

    }
}
exports.event = new MessageReactionRemoveHandler;