const { command } = require('../command.js');
const owoify = require('owoify-js').default;

const _clean = text => {
    let rx = /`/g;
    let rx2 = /\*/g;
    let rx3 = /\*/g;
    
	if (typeof(text) === "string")
        return text.replace(rx, "\\`").replace(rx2, "\\*").replace(rx3, "\\*");
	else
		return text;
};

class Owo extends command{
    constructor(){
        super();
        this.name = "owoify";
        this.id = this.name;
        this.helpInfo = "owoifies some text, has 3 levels (owo, uwu, and uvu), put the level as the first word";
        this.commandType = "fun";

    }
    async execute(msg, args){
        //console.log(args);
        if(args[0] == "uwu"){
            //console.log("uwu");
            let text = args.slice(1, args.length).join(" ");
            let output = _clean(owoify(text, "uwu"));
            if(output.length > 2000){
                msg.channel.createMessage("The output was too long!");
                return;
            }
            msg.channel.createMessage(output);
            return;
        }else{
            if(args[0] == "uvu"){
                //console.log("uvu");
                let text = args.slice(1, args.length).join(" ");
                let output = _clean(owoify(text, "uvu"));
                if(output.length > 2000){
                    msg.channel.createMessage("The output was too long!");
                    return;
                }
                msg.channel.createMessage(output);
                return;
            }else{
                let text = args.slice(0, args.length).join(" ");
                let output = _clean(owoify(text));
                if(output.length > 2000){
                    msg.channel.createMessage("The output was too long!");
                    return;
                }
                msg.channel.createMessage(output);
                return;
            }
        }
    }
}
exports.cmd = Owo;