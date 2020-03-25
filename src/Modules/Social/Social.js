const Module = require("../../Core/Sructures/Module.js").struct;




class Social extends Module{
    constructor(){
        super({
            name: "Social",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false
        });

        this.modpath = `${__dirname}/Module`;
        this.cmdpath = `${__dirname}/Commands`;

    }
}

exports.module = new Social();