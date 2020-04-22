import {Module} from "../../Core/Structures/Module";

class Internal extends Module{
    constructor(){
        super({
            name: "internal",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        });

    }
}
export default Internal;