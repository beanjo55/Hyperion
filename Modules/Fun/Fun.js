const Module = require("../../Core/Structures/Module.js").struct;

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
exports.module = Fun;