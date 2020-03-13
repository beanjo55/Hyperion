class GuildMemberAddHandler{
    constructor(){
        this.name = "guildMemberAdd";
        this.handler = this.handle;
    }
    async handle(guild, member){

    }
}
exports.event = new GuildMemberAddHandler;