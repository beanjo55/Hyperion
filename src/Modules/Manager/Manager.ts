import Module from "../../Structures/Module";
import hyperion from "../../main";
import { Guild, Message } from "eris";
import {inspect} from "util";

export default class Manager extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "manager",
            dir: __dirname,
            path: __dirname + "/Manager.js",
            hasCommands: true,
            alwaysEnabled: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }
}