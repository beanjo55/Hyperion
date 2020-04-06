import {Module} from "../../Core/Structures/Module";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../types";

class Starboard extends Module{
    constructor(){
        super({
            name: "starboard",
            hasCommands: true,
            friendlyName: "Starboard",
            hasCfg: true,
            dirname: __dirname
        });
    }
}
export default Starboard;