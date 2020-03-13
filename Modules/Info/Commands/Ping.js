const command = require('../../../Core/Structures/Command.js').struct;

class Ping extends command{
    constructor(){
        super();
        this.name = "ping";
        this.id = this.name;
        this.module = "Info";
        this.aliases = ["pong"];

        this.alwaysEnabled = true;
    }

    async execute(ctx){
        return await ctx.channel.createMessage("Ping?").then(msg => {
            return msg.edit(`Pong! ${msg.timestamp-ctx.msg.timestamp}ms`)
        })
    }
}
exports.cmd = Ping;