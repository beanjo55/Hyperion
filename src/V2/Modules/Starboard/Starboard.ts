/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Module, ConfigKey} from "../../Structures/Module";
import {IHyperion, GuildConfig} from "../../types";
import { Message, Emoji, Collection, Member } from "eris";

class Starboard extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "starboard",
            hasCommands: false,
            friendlyName: "Starboard",
            hasCfg: true,
            dirname: __dirname,
            needsLoad: true,
            defaultStatus: false,
            subscribedEvents: ["messageReactionAdd", "messageReactionRemove"]
        }, Hyperion);
        this.configKeys = this.loadKeys();
    }

    loadKeys(): Collection<ConfigKey>{
        const col = new Collection(ConfigKey);
        col.add(new ConfigKey({
            parent: this.name,
            id: "starChannel",
            ops: [0, 1, 4],
            description: "The channel that starred posts are reposted in",
            friendlyName: "Starboard Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "starCount",
            ops: [0, 1, 4],
            description: "The number of stars needed for a post to be reposted in the starboard",
            friendlyName: "Star Count",
            dataType: "number",
            array: false,
            default: 3
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "ignoredChannels",
            ops: [0, 2, 3, 4],
            description: "Posts in ignored channels will never show on the starboard, even if they are starred",
            friendlyName: "Ignored Channels",
            dataType: "channel",
            array: true,
            default: []
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "selfStar",
            ops: [0, 1, 4],
            description: "If a user starring their own post should be ignored",
            friendlyName: "Self Star",
            dataType: "boolean",
            array: false,
            default: false
        }));
        return col;
    }

    async messageReactionAdd(...args: [Message, Emoji, Member | {id: string}]): Promise<void>{
        const msg = args[0];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const conf = await this.Hyperion.managers.guild.getConfig(msg.channel.guild.id);
        this.Star(this.Hyperion, msg, args[1], args[2].id, conf, "add");
    }

    async messageReactionRemove(...args: [Message, Emoji, string]): Promise<void>{
        const msg = args[0];
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const conf = await this.Hyperion.managers.guild.getConfig(msg.channel.guild.id);
        this.Star(this.Hyperion, msg, args[1], args[2], conf, "del");
    }
}
export default Starboard;