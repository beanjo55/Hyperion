import Module from "../../Structures/Module";
import hyperion from "../../main";
import { Message } from "eris";
import {inspect} from "util";

export default class Dev extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(...args: [Message]): Promise<void>{
        //console.log((args[0]).content);
        const msg = args[0];
        if(msg.author.id === "253233185800847361" && msg.content.startsWith("%%eval")){
            const code = msg.content.split(" ").slice(1).join(" ");
            const evaled = await eval(code);
            const response = inspect(evaled, {depth: 0});
            msg.channel.createMessage({embed: {
                title: "DIRTY V3 EVAL",
                color: 6658041,
                description: `\`\`\`js\n${response.length > 1990 ? response.substring(0, 1990) + "..." : response}\`\`\``,
                timestamp: new Date
            }});
        }
    }

    async onLoad(){
        return true;
    }
}