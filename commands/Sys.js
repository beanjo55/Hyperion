const { command } = require('../command.js');
const os = require("os");



class Sys extends command{
    constructor(){
        super();
        this.name = "sys";
        this.id = this.name;
        this.helpInfo = "shows some system info";
        this.commandType = "info";
    }
    async execute(msg, args, Hyperion){
        msg.channel.createMessage(`\`\`\`\nSystem info: ${process.platform}-${process.arch} with ${process.release.name} version ${process.version.slice(1)}\nProcess info: PID ${process.pid}\nProcess memory usage: ${Math.ceil(process.memoryUsage().heapTotal / 1000000)} MB\nSystem memory usage: ${Math.ceil((os.totalmem() - os.freemem()) / 1000000)} of ${Math.ceil(os.totalmem() / 1000000)} MB\nBot info: ID ${Hyperion.user.id} #${Hyperion.user.discriminator}\n\`\`\``);

    }
}
exports.cmd = Sys;