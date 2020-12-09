import Module, { configKey } from "../../Structures/Module";
import hyperion from "../../main";
import { Message } from "eris";
import {inspect} from "util";
interface devConfig {sally: number; friends: Array<string>}

const keys: {[key: string]: configKey} = {
    "sally": {
        name: "sally",
        array: false,
        default: 3,
        key: "sally",
        langName: "sally",
        aliases: ["sal cute"],
        type: "number"
    },
    "friends": {
        name: "friends",
        array: true,
        default: [],
        key: "friends",
        langName: "friends",
        type: "user"
    }
};

export default class Dev extends Module<devConfig> {
    constructor(Hyperion: hyperion){
        const configKeys = new Map<string, configKey>(Object.entries(keys));

        super({
            name: "dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            subscribedEvents: ["messageCreate"],
            hasCommands: true,
            config: (data: Partial<devConfig>): devConfig => {
                const out: Partial<devConfig> = {};
                out.friends = data.friends ?? [];
                out.sally = data.sally ?? 3;
                return out as devConfig;
            },
            configKeys
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