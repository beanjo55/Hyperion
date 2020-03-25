const { inspect } = require('util');
import {HyperionInterface} from "../types";
import {Message, Guild, TextChannel} from 'eris';
class MessageCreateHandler{
    name: String;
    constructor(){
        this.name = "messageCreate"
    }

    async handle(this: HyperionInterface, msg: Message){
        
        if(msg.channel.type !== 0){
            return;
        }
        let guild: Guild = msg.channel.guild;
        if(msg.author.bot){
            return;
        }


        this.handler(msg);
        //msg.channel.createMessage("```js\n" + inspect(await this.handler(msg), {depth: 1}) + "```");
    }
}
exports.event = new MessageCreateHandler;