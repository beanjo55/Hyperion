import Module from "../../Structures/Module";
import hyperion from "../../main";
import { Guild, Message } from "eris";
import {inspect} from "util";

export default class Info extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "info",
            dir: __dirname,
            path: __dirname + "/Info.js",
            hasCommands: true,
            alwaysEnabled: true,
            subscribedEvents: ["guildCreate", "guildDelete", "ready"]
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    guildCreate(...args: [Guild]): void {
        this.Hyperion.manager.guild(args[0].id).getOrCreate().then(data => {
            this.Hyperion.manager.guild(args[0].id).update(data);
        });
    }

    guildDelete(...args: [Guild]): void {
        this.Hyperion.manager.guild(args[0].id).getOrCreate().then(data => {
            data.deleted = true;
            data.deletedAt = Date.now();
            this.Hyperion.manager.guild(args[0].id).update(data);
        });
    }
}