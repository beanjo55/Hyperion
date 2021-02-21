import Module from "../../Structures/Module";
import hyperion from "../../main";

export default class Info extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "info",
            dir: __dirname,
            path: __dirname + "/Info.js",
            hasCommands: true,
            alwaysEnabled: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    async onUnload(){
        return true;
    }
}