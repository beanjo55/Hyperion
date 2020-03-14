const module = require("../../Core/Structures/Module.js");

class Info extends module{
    constructor(){
        super({
            name: "info",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false
        });
    }
}
exports.module = Info;