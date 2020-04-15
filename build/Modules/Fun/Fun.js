"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../Core/Structures/Module");
class Fun extends Module_1.Module {
    constructor() {
        super({
            name: "fun",
            friendlyName: "Fun",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        });
    }
}
exports.default = Fun;
