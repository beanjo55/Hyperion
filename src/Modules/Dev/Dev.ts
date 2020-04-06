import {Module} from "../../Core/Structures/Module";

class Dev extends Module{
    constructor(){
        super({
            name: "dev",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        });

    }
}
export default Dev;