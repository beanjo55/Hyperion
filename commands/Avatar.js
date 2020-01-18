const { command } = require('../command.js');


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
        let memb = null;
    if(args.length != 0){
        
        if(msg.mentions.length != 0){
            memb = await msg.channel.guild.getRESTMember(msg.mentions[0].id);
        }
        else{
            let uIDt = args[0].match(/^\d+$/);
            if(uIDt !== null){
                let uID = uIDt[0];
                memb = await msg.channel.guild.getRESTMember(uID);
            } else{
                msg.channel.createMessage("I'm not sure who that is, try a user ID or mention them");
            }
        }
    }
    else{
        memb = msg.member;
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