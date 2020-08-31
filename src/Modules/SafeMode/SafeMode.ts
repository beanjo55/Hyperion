import { Message } from "eris";
import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";
import {exec} from "child_process";
import {inspect} from "util";

class SafeMode extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "safeMode",
            friendlyName: "Safe Mode",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname,
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(Hyperion: IHyperion, msg: Message): Promise<void>{
        if(msg.author.id !== "253233185800847361"){return;}
        if(!msg.content.startsWith((this.Hyperion.adminPrefix ?? "h.") + "s")){return;}
        const label = msg.content.split(" ").slice(0, 1)[0].slice((this.Hyperion.adminPrefix ?? "h.").length + 1).trim().toLowerCase();
        const args = msg.content.split(" ").slice(1);
        if(!label){return;}
        switch(label){
        case "ping": {
            const start = Date.now();
            msg.channel.createMessage("Ping?").then(x => {
                x.edit(`Pong! ${Date.now() - start}ms`);
            }).catch(() => undefined);
            break;
        }
        case "r":
        case "restart": {
            exec("pm2 restart 0");
            break;
        }
        case "ex": {msg.channel.createMessage("https://tenor.com/view/pants-pull-up-your-gif-11069354"); break;}
        case "exec": {
            try{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exec(args.join(" "), (error: any, stdout: any) => {
                    const outputType = error || stdout;
                    let output = outputType;
                    if (typeof outputType === "object") {
                        output = inspect(outputType, {depth: 0});
                    }
                    output = (output.length > 1980 ? output.substr(0, 1977) + "..." : output);
                    output = "```" + output + "```";
                    
                    msg.channel.createMessage(output);
                });
                
            }catch(err){
                msg.channel.createMessage("something went wrong");
            }
            break;
        }
        case "e":
        case "eval": {
            const code = args.join(" ");
            try {
                let evaled = await eval(code);
                if(typeof evaled !== "string"){
                    evaled = inspect(evaled, {depth: 0});
                }
                if(evaled.length > 1990){
                    msg.channel.createMessage("too long");
                }else{
                    msg.channel.createMessage({
                        embed: {
                            color: 6658041,
                            timestamp: new Date(),
                            description: "```js\n" + evaled + "```"
                        }
                    });
                }
            }catch(err){
                msg.channel.createMessage("`ERROR`\n```xl\n" + err.message + "```");
            }
            break;
        }
        default: {break;}
        }
        return;
    }
}
export default SafeMode;