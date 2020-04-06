import {Module} from "../../Core/Structures/Module";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../types";

class CommandHandler extends Module{
    constructor(){
        super({
            name: "commandhandler",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: true,
            needsLoad: true,
            hasCfg: false,
            dirname: __dirname
        });
    }

    init(Hyperion: HyperionInterface){
        this.Handler = this.Handler.bind(Hyperion);
        this.cooldowns = {};
        Hyperion.handler = this.Handler;
    }

    /*
    registerCommandHandler(conf){
        
    }*/
}
export default CommandHandler;