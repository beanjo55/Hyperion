const { command } = require('../command.js');



class Info extends command{
    constructor(){
        super();
        this.name = "info";
        this.id = this.name;
        this.helpInfo = "Shows some bot info"
        this.commandType = "info";

    }
    async execute(msg, args, Hyperion){
        const data = {
            embed: {
                color: 0xe87722,
                timestamp: new Date(),
                fields: [
                    {
                        name: "Author",
                        value: "bean#8888"
                    },
                    {
                        name: "Guilds",
                        value: Hyperion.guilds.size
                    },
                    {
                        name: "Users",
                        value: Hyperion.users.size
                    },
                    {
                        name: "Invite",
                        value: "[Invite me here!](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&scope=bot)"
                    },
                    {
                        name: "Support",
                        value: "[Join the support server here!](https://discord.gg/Vd8vmBD)"
                    }
                ]

                
            }
        };
        msg.channel.createMessage(data);
        
    }
}
exports.cmd = Info;