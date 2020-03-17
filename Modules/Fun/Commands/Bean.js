const command = require('../../../Core/Structures/Command.js').struct;

class Bean extends command{
    constructor(){
        super();
        this.name = "bean";
        this.id = this.name;
        this.module = "Fun";
    }

    async execute(ctx){
        const data = {
            content: ctx.args.join(" "),
            embed: {
                title: "BEANED!!!",
                color: ctx.Hyperion.defaultColor,
                timestamp: new Date(),
                image: {
                    url: "https://cdn.discordapp.com/attachments/239446877953720321/333048272287432714/unknown.png"
                }
            }
        };
        
        return {status: {code: 0}, payload: data};
    }
}
exports.cmd = Bean;