import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Dev extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "dev",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        }, Hyperion);

    }
}
export default Dev;