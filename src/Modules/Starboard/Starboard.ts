/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Module, ConfigKey} from "../../Core/Structures/Module";
import {HyperionInterface, GuildConfig} from "../../types";
import { Message, Emoji, Collection } from "eris";

class Starboard extends Module{
    constructor(){
        super({
            name: "starboard",
            hasCommands: false,
            friendlyName: "Starboard",
            hasCfg: true,
            dirname: __dirname,
            needsLoad: true,
        });
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
            array: true
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

    async reactionAdd(Hyperion: HyperionInterface, guildConfig: GuildConfig, msg: Message, emote: Emoji, user: string): Promise<void>{

    }

    async reactionRemove(Hyperion: HyperionInterface, guildConfig: GuildConfig, msg: Message, emote: Emoji, user: string): Promise<void>{
        
    }
}
export default Starboard;