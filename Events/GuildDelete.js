class GuildDeleteHandler{
    constructor(){
        this.name = "guildDelete";
        this.handler = this.handle;
    }
    async handle(guild){

    }
}
exports.event = new GuildDeleteHandler;