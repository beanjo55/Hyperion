import Module from "../../Structures/Module";
import hyperion from "../../main";
import { Message } from "eris";
import {inspect} from "util";

export default class CommandHandler extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "commandHandler",
            dir: __dirname,
            path: __dirname + "/CommandHandler.js",
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(...args: [Message]): Promise<void>{
        const msg = args[0];
    }

    async onLoad(){
        return true;
    }
}