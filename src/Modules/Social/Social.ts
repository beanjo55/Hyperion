import {Module} from "../../Core/Structures/Module";

class Social extends Module{
    constructor(){
        super({
            name: "social",
            friendlyName: "Social",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: true,
            dirname: __dirname
        });
    }
}
export default Social;