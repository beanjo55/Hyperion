import { Collection } from "eris";
import {ConfigKey, Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Suggestions extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "suggestions",
            friendlyName: "Suggestions",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: true,
            dirname: __dirname
        }, Hyperion);
        this.configKeys = this.loadKeys();
    }

    loadKeys(): Collection<ConfigKey>{
        const col = new Collection(ConfigKey);
        col.add(new ConfigKey({
            parent: this.name,
            id: "suggestionChannel",
            ops: [0, 1, 4],
            description: "The channel suggestions are sent in",
            friendlyName: "Suggestion Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "checkOtherSuggestions",
            ops: [0, 1, 4],
            description: "If users can check the status of suggestion they did not make",
            friendlyName: "Check Other User Suggestions",
            dataType: "boolean",
            array: false,
            default: true
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "approveChannel",
            ops: [0, 1, 4],
            description: "The channel approved suggestions are reposted in",
            friendlyName: "Approved Suggestions Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "denyChannel",
            ops: [0, 1, 4],
            description: "The channel denied suggestions are reposted in",
            friendlyName: "Denied Suggestions Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "considerChannel",
            ops: [0, 1, 4],
            description: "The channel considered suggestions are reposted in",
            friendlyName: "Considered Suggestions Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "anonReviews",
            ops: [0, 1, 4],
            description: "If the responsible reviews is hidden",
            friendlyName: "Anonymous Reviews",
            dataType: "boolean",
            array: false,
            default: false
        }));
        return col;
    }
}
export default Suggestions;