import Module from "../../Structures/Module";
import hyperion from "../../main";

export default class Dev extends Module {
    constructor(Hyperion: hyperion){
        super({
            name: "Dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            subscribedEvents: ["messageCreate"]
        }, Hyperion)
    }

    messageCreate(...args: Array<unknown>): void{
        console.log((args[0] as any).content)
    }

    async onLoad(){
        return true;
    }
}