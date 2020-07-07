import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Info extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "info",
            friendlyName: "Info",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname
        }, Hyperion);
    }
}
export default Info;