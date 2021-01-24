import {Module} from "../../Structures/Module";
import { IHyperion } from "../../types";

class Social extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "social",
            friendlyName: "Social",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname
        }, Hyperion);
    }
}
export default Social;