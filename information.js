const { Hyperion } = require("./main.js");
const os = require("os");




/*
Hyperion.registerCommand("ping", (msg, args) =>{
    msg.channel.createMessage("pong").then(pingmsg => {
        return pingmsg.edit(`${pingmsg.content} \`${pingmsg.timestamp - msg.timestamp}ms\``)
});
}, {
    description: 'Ping me to make sure I\'m alive',
    fullDescription: 'The bot will reply with the amount of time taken'

});
*/
Hyperion.registerCommand("sys", (msg, args) => {
    msg.channel.createMessage(`\`\`\`\nSystem info: ${process.platform}-${process.arch} with ${process.release.name} version ${process.version.slice(1)}\nProcess info: PID ${process.pid}\nProcess memory usage: ${Math.ceil(process.memoryUsage().heapTotal / 1000000)} MB\nSystem memory usage: ${Math.ceil((os.totalmem() - os.freemem()) / 1000000)} of ${Math.ceil(os.totalmem() / 1000000)} MB\nBot info: ID ${Hyperion.user.id} #${Hyperion.user.discriminator}\n\`\`\``);

},{
    description: "system info"

});

Hyperion.registerCommand("whois", async (msg, args) => {
    if(args.length != 0){
        if(msg.mentions.length != 0){
            memb = msg.mentions[0];
        }
        else{
            uIDt = args[0].match(/^\d+$/);
            if(uIDt !== null){
                uID = uIDt[0];
                memb = await msg.channel.guild.getRESTMember(uID);
            } else{
                msg.channel.createMessage("I'm not sure who that is, try a user ID or mention them");
            }
        }
    }
    else{
        memb = msg.member;
    }
    const jat = new Date(memb.joinedAt);
    const cat = new Date(memb.createdAt);
    const data = {
        embed: {
             thumbnail: {
                 url: memb.avatarURL
             },
             author: {
                 name: memb.username + "#" + memb.discriminator,
                 icon_url: memb.avatarURL
             },
             fields: [
                 {
                     name: "created at",
                     value: cat.toDateString(),
                     inline: true
                 },

                 {
                     //do not fix typo
                    name: "joinedat",
                    value: jat.toDateString(),
                    inline: true
                }
             ]
        }
   }





    msg.channel.createMessage(data);
},{
    description: "shows info about a user",
    aliases: ["w"]
});

Hyperion.registerCommand("avatar", async (msg, args) => {
    if(args.length != 0){
        if(msg.mentions.length != 0){
            memb = msg.mentions[0];
        }
        else{
            uIDt = args[0].match(/^\d+$/);
            if(uIDt !== null){
                uID = uIDt[0];
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
            image:{
                url: memb.avatarURL
            }
        }
    }
    msg.channel.createMessage(data);
},{
    description: "shows a user's avatar",
    aliases: ["av"]
});