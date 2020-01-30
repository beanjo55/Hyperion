const { command } = require('../command.js');



class Ping extends command{
    
    constructor(){
        super();
        this.name = "ping";
        this.aliases = ["pong", "pang"];
        this.alwaysEnabled = true;
        this.id = this.name;
        this.helpInfo = "You should know this, but checks the bot's latency";
        this.commandType = "info";
    }
    async execute (msg)  {
        //hi
        return await msg.channel.createMessage("pong").then(pingmsg =>{
            return pingmsg.edit(`${pingmsg.content} \`${pingmsg.timestamp - msg.timestamp}ms\``)
        });
    }
}
exports.cmd = Ping;