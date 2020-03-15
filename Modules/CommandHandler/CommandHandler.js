const Module = require("../../Core/Structures/Module.js").struct;

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

    init(Hyperion){
        
        this.Handler = this.Handler.bind(Hyperion);
        this.cooldowns = {};
        Hyperion.handler = this.Handler;
    }
}
exports.module = CommandHandler;