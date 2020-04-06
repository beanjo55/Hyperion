import {Module} from "../../Core/Structures/Module";

class Info extends Module{
    constructor(){
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
        });
    }
}
export default Info;