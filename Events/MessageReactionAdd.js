class MessageReactionAddHandler{
    constructor(){
        this.name = "messageReactionAdd";
        this.handler = this.handle;
    }
    async handle(msg, emote, userId){

    }
}
exports.event = new MessageReactionAddHandler;