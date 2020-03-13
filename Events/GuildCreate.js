class GuildCreateHandler{
    constructor(){
        this.name = "guildCreate";
    }
    async handle(guild){
        let guildconf = new this.models.guildconf({
            guild: guild.id
        })
    }
}
exports.event = new GuildCreateHandler;