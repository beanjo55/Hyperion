import {Module} from "../../Core/Structures/Module";

class Manager extends Module{
    constructor(){
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
        });
    }
}
export default Manager;