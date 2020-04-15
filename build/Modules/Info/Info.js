"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../Core/Structures/Module");
class Info extends Module_1.Module {
    constructor() {
        super({
            name: "info",
            friendlyName: "Info",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname
        });
    }
}
exports.default = Info;
