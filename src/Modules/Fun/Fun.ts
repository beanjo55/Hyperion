import {Module} from "../../Core/Structures/Module";

class Fun extends Module{
    constructor(){
        super({
            name: "fun",
            friendlyName: "Fun",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        });
    }
}
export default Fun;