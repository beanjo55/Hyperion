import {Module} from "../../Core/Structures/Module";

class Info extends Module{
    constructor(){
        super({
            name: "info",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false
        });
        this.cmdpath = `${__dirname}/Commands`;
    }
}
export default Info;