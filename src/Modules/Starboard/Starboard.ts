import {Module} from "../../Core/Structures/Module";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../types";

class Starboard extends Module{
    constructor(){
        super({
            name: "starboard",
            hasCommands: false,
            friendlyName: "Starboard",
            hasCfg: true,
            dirname: __dirname,
            needsLoad: true
        });
    }
}
export default Starboard;