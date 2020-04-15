"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../Core/Structures/Module");
class Starboard extends Module_1.Module {
    constructor() {
        super({
            name: "starboard",
            hasCommands: false,
            friendlyName: "Starboard",
            hasCfg: true,
            dirname: __dirname,
            needsLoad: true
        });
    }
}
exports.default = Starboard;
