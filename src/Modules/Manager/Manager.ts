import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Manager extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "manager",
            friendlyName: "Manager",
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
export default Manager;