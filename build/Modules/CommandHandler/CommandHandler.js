"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../Core/Structures/Module");
class CommandHandler extends Module_1.Module {
    constructor() {
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
    init(Hyperion) {
        this.Handler = this.Handler.bind(Hyperion);
        this.cooldowns = {};
        Hyperion.handler = this.Handler;
    }
}
exports.default = CommandHandler;
