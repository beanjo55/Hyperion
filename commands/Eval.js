/* eslint-disable no-unused-vars */
const { inspect } = require('util');
const { command } = require('../command.js');
const config = require("../config.json");


const lyss = "bestest";
const conor = "great";
const wuper = "pilot";
const sobriquet = "webhook";
const fang = "sexy";
const deerninja = "cool trucker";
const soda = "fan of night water";
const raven = "<a:eatbanana:651480671256313866>";

const _clean = text => {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
};


class Eval extends command{
    constructor(){
        super();
        this.name = "eval";
        this.aliases = ["e", "evaluate"];
        this.alwaysEnabled = true;
        this.requiredUsers = ["253233185800847361"];
        this.id = this.name;
    }
    async execute (msg, args, Hyperion){
        
        if(msg.author.id !== config.owner){
            console.log("in eval id check failed");
            return;
        }
        const tRegex = /token/gi;
        
        
    
        try {
    
            const code = args.join(" ");
            /*if(code.includes("token")){
                relay.createMessage(msg.channel.id, "unsafe eval, aborted");
                return;
            }*/
            let evaled = await eval(code);
            if (typeof evaled !== "string")
                evaled = inspect(evaled, {depth: 0});
            if(evaled.includes("token") || evaled.includes(config.token)){
                evaled = evaled.replace(tRegex, "Fuck You");
                evaled = evaled.replace(config.token, "Fuck You");
            }
            if (evaled.length > 1900) {
                console.log(_clean(evaled));
                msg.channel.createMessage( 'output too long, sent to log');
            }
            else {
                const data = {
                    embed: {
                         author: { name: 'Eval Results', icon_url: msg.author.avatarURL },
                         description: "``` " + _clean(evaled) + "```",
                         color: 0xe87722,
                         timestamp: new Date(),
                    }
               }
                //relay.createMessage(msg.channel.id, clean(evaled));
                msg.channel.createMessage(data);
            }
        }
        catch (err) {
            msg.channel.createMessage(`\`ERROR\` \`\`\`xl\n${_clean(err)}\n\`\`\``);
        }
    }

    



}
exports.cmd = Eval;