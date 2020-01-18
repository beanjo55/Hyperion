const { command } = require('../command.js');
const { resolveUser } = require("../util.js");


class Avatar extends command{
    constructor(){
        super();
        this.name = "avatar";
        this.aliases = ["av"];
        this.id = this.name;
        this.helpInfo = "shows your or another user's avatar";
        this.commandType = "info";
    }
    async execute (msg, args){
    let memb = undefined;
        
    memb = resolveUser(msg, args[0]);
    if(!memb){
        msg.channel.createMessage("I'm not sure who that is, try a user ID or mention them");
    }
    const data = {
        embed: {
            author: {
                name: "avatar for " + memb.username + "#" + memb.discriminator,
                icon_url: memb.avatarURL
            },
            color: 0xe87722,
            image:{
                url: memb.avatarURL
            }
        }
    }
    msg.channel.createMessage(data);
    }
}
exports.cmd = Avatar;