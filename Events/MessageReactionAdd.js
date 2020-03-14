class MessageReactionAddHandler{
    constructor(){
        this.name = "messageReactionAdd";
    }
    async handle(msg, emote, userId){

    }
}
exports.event = new MessageReactionAddHandler;