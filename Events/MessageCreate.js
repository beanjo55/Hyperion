class MessageCreateHandler{
    constructor(){
        this.name = "messageCreate"
    }

    async handle(msg){
        
        if(!msg.channel.guild){
            return;
        }

        if(msg.author.bot){
            return;
        }

        if(!this.guilds.get(msg.channel.guild.id).fetched){
            this.guilds.get(msg.channel.guild.id).fetchAllMembers().catch(err =>{
                this.logger.warn("Hyperion", "Guild Member Fetch", `error fetching members for ${msg.channel.guild.id}, error: ${err}`)
            });
            this.guilds.get(msg.channel.guild.id).fetched = true;
        }
    }
}
exports.event = new MessageCreateHandler;