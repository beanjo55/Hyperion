const Module = require("../../Core/Structures/Module.js").struct;

class Dev extends Module{
    constructor(){
        super({
            name: "dev",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false
        });
        this.cmdpath = `${__dirname}/Commands`;
    }
}
exports.module = Dev;