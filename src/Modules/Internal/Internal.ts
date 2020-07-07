import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Internal extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "internal",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        }, Hyperion);

    }
}
export default Internal;