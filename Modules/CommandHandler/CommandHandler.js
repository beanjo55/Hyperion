const module = require("../../Core/Structures/Module.js");

class CommandHandler extends module{
    constructor(){
        super({
            name: "commandhandler",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: true
        });
    }

    init(Hyperion){
        this.Handler = this.Handler.bind(Hyperion);
        this.cooldowns = {};
    }
}
exports.module = CommandHandler;