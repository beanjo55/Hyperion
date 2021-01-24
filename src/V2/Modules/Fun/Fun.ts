import {Module} from "../../Structures/Module";
import { IHyperion } from "../../types";

class Fun extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "fun",
            friendlyName: "Fun",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        }, Hyperion);
    }
}
export default Fun;