class MessageReactionRemoveHandler{
    constructor(){
        this.name = "messageReactionRemove";
    }
    async handle(msg, emote, userID){

    }
}
exports.event = new MessageReactionRemoveHandler;