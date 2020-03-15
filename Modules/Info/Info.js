const Module = require("../../Core/Structures/Module.js").struct;

class Info extends Module{
    constructor(){
        super({
            name: "info",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false
        });
        this.cmdpath = `${__dirname}/Commands`;
    }
}
exports.module = Info;