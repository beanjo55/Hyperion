"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../Core/Structures/Module");
class Dev extends Module_1.Module {
    constructor() {
        super({
            name: "dev",
            private: true,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname
        });
    }
}
exports.default = Dev;
