import Module from "../../Structures/Module";
import hyperion from "../../main";


export default class Fun extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "fun",
            dir: __dirname,
            path: __dirname + "/Fun.js",
            hasCommands: true,
            alwaysEnabled: false,
            subscribedEvents: [],
            friendlyName: "Fun"
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

}