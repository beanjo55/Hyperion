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

const options = ["owo", "uwu", "uvu"];

class Owo extends command{
    constructor(){
        super();
        this.name = "owoify";
        this.id = this.name;
        this.helpInfo = "owoifies some text, has 3 levels (owo, uwu, and uvu), put the level as the first word";
        this.commandType = "fun";

    }
    async execute(msg, args){
        let text = "";
        let output = "";
        const randomInt = Math.floor(Math.random(0, options.length) * options.length);
        switch(args[0]){
            case 'owo':
                text = args.slice(1, args.length).join(" ");
                output = _clean(owoify(text), "owo");
                break;
            case 'uwu':
                text = args.slice(1, args.length).join(" ");
                output = _clean(owoify(text), "uwu");
                break;
            case 'uvu':
                text = args.slice(1, args.length).join(" ");
                output = _clean(owoify(text), "uvu");
                break;
            default:
                text = args.slice(0, args.length).join(" ");
                output = _clean(owoify(text), options[randomInt]);
                break;
        }
        if(output.length>2000){
            output = "The output was too long!"
        }
        if(output.length === 0){
            output = "There was no output"
        }
        try{
            await msg.channel.createMessage(output)
        }catch(err){
            return Promise.reject(err);
        }
        return Promise.resolve("success")
    }
}
exports.cmd = Owo;