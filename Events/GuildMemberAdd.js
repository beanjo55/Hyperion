class GuildMemberAddHandler{
    constructor(){
        this.name = "guildMemberAdd";
    }
    async handle(guild, member){

    }
}
exports.event = new GuildMemberAddHandler;