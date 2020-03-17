const { command } = require('../command.js');
const { exec } = require('child_process');
const config = require("../config.json");




class Restart extends command{
    constructor(){
        super();
        this.name = "restart";
        this.aliases = ["r"];
        this.alwaysEnabled = true;
        this.id = this.name;
        this.requiredUsers = ["253233185800847361"];
        this.commandType = "internal";

    }
    async execute (msg, args) {
        if(msg.author.id !== config.owner){
            return;
        }
        if(args.length > 0){
            if(args[0] === "Hyperion"){
                msg.channel.createMessage("restarting Hyperion");
                exec("pm2 restart Hyperion");
                return;
            }

            if(args[0] === "Relay"){
                msg.channel.createMessage("restarting Relay");
                exec("pm2 restart Relay");
                return;
            }
        }
        await msg.channel.createMessage("bye\nhttps://tenor.com/view/guacamole-guac-dance-happy-chips-gif-5015394");
        process.exit(1);
        return;
    }






}
exports.cmd = Restart;