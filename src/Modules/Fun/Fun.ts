import {Module} from "../../Core/Structures/Module";

class Fun extends Module{
    constructor(){
        super({
            name: "fun",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false
        });
        this.cmdpath = `${__dirname}/Commands`;
    }
}
export default Fun;