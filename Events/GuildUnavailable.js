class GuildUnavailableHandler{
    constructor(){
        this.name = "guildUnavailable";
        this.handler = this.handle;
    }
    async handle(guild){

    }
}
exports.event = new GuildUnavailableHandler;