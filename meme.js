const { Hyperion } = require("./main.js");
const owoify = require('owoify-js').default;

const clean = text => {
    let rx = /\`/g;
    let rx2 = /\*/g;
    let rx3 = /\*/g;
    
	if (typeof(text) === "string")
	  return text.replace(rx, "\\`").replace(rx2, "\\*").replace(rx3, "\\*");
	else
		return text;
};

Hyperion.registerCommand("owoify", (msg, args) => {
    text = args.slice(0, args.length).join(" ");
    output = clean(owoify(text));
    if(output.length > 2000){
        msg.channel.createMessage("The output was too long!");
        return;
    }
    msg.channel.createMessage(output);
    return;
},{
    description: "owoifies text"
});

Hyperion.registerCommand("uwuify", (msg, args) => {
    text = args.slice(0, args.length).join(" ");
    output = clean(owoify(text, "uwu"));    
    if(output.length > 2000){
        msg.channel.createMessage("The output was too long!");
        return;
    }
    msg.channel.createMessage(output);
    return;
},{
    description: "uwuifies text"
});

Hyperion.registerCommand("uvuify", (msg, args) => {
    text = args.slice(0, args.length).join(" ");
    output = clean(owoify(text, "uvu"));
    if(output.length > 2000){
        msg.channel.createMessage("The output was too long!");
        return;
    }
    msg.channel.createMessage(output);
    return;
},{
    description: "uvuifies text"
});