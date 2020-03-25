import {Module} from "../../Core/Structures/Module";
import {HyperionInterface} from "../../types"

class CommandHandler extends Module{
    constructor(){
        super({
            name: "commandhandler",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: true,
            needsLoad: true
        });
        this.modpath = `${__dirname}/Module`;
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