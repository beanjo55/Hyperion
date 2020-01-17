
const { exec } = require('child_process');
const { Hyperion } = require("./main.js");
const config = require("./config.json");




Hyperion.registerCommand("die", async (msg, args) => {
    if(msg.author.id !== config.owner){
        return;
    }
    Hyperion.createMessage(msg.channel.id, "ok");
    exec("pm2 stop main.js");
    return;
},{
    desrcription: "stops the bot",
    fullDescription: "stops the bot via pm2",
    hidden: true,
    aliases: [],
    requirements: {
        userIDs: ["253233185800847361"]
    }
});



Hyperion.registerCommand("game", async (msg, args) => {
    if(msg.author.id !== config.owner){
        return;
    }
    if (args.length === 1) {
        try {
            Hyperion.editStatus(args[0]);
            Hyperion.createMessage(msg.channel.id, "Status changed to: " + args[0]);
            return;
        }
        catch (error) {
            Hyperion.createMessage(msg.channel.id, "Invalid status specified");
            }
    }
    else {
        let game = args.join(" ");
        Hyperion.editStatus({
            name: game
        });
    }
},{
    description: "changes status and game",
    hidden: true,
    requirements: {
        userIDs: ["253233185800847361"]
    }
});





