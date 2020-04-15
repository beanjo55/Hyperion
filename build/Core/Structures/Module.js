"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
const fs = require("fs");
const { inspect } = require("util");
class Module {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.name = (_a = data.name) !== null && _a !== void 0 ? _a : "module";
        this.friendlyName = (_b = data.friendlyName) !== null && _b !== void 0 ? _b : this.name;
        this.id = this.name;
        this.private = (_c = data.private) !== null && _c !== void 0 ? _c : false;
        this.alwaysEnabled = (_d = data.alwaysEnabled) !== null && _d !== void 0 ? _d : false;
        this.defaultStatus = (_e = data.defaultStatus) !== null && _e !== void 0 ? _e : true;
        this.hasCfg = (_f = data.hasCfg) !== null && _f !== void 0 ? _f : false;
        this.hasCommands = (_g = data.hasCommands) !== null && _g !== void 0 ? _g : false;
        this.needsInit = (_h = data.needsInit) !== null && _h !== void 0 ? _h : false;
        this.needsLoad = (_j = data.needsLoad) !== null && _j !== void 0 ? _j : false;
        this.cmdpath = `${data.dirname}/Commands`;
        this.modpath = `${data.dirname}/Module`;
    }
    loadMod() {
        try {
            const modFiles = fs.readdirSync(this.modpath);
            modFiles.forEach((e) => {
                if (!e.startsWith(".")) {
                    try {
                        let name = e.substring(0, e.length - 3);
                        let modfile = require(`${this.modpath}/${e}`).modfile;
                        if (modfile === undefined) {
                            modfile = require(`${this.modpath}/${e}`).default;
                        }
                        this[name] = modfile;
                    }
                    catch (err) {
                        Logger_1.logger.error("Hyperion", "Load Mod", `Error laoding mod file ${e}, error: ${err}`);
                    }
                }
            });
        }
        catch (err) {
            Logger_1.logger.error("Hyperion", "Load Mod", `Error loading module files for module ${this.name}: ${err}`);
        }
    }
    loadCommands(Hyperion) {
        try {
            const cmdFiles = fs.readdirSync(this.cmdpath);
            cmdFiles.forEach((e) => {
                if (!e.startsWith(".")) {
                    try {
                        const precmd = require(`${this.cmdpath}/${e}`).default;
                        let cmd = new precmd;
                        if (cmd.hasSub) {
                            const subcommands = require(`${this.cmdpath}/${e}`).subcmd;
                            subcommands.forEach((scmd) => {
                                cmd.subcommands.add(new scmd);
                            });
                        }
                        Hyperion.commands.add(cmd);
                    }
                    catch (err) {
                        Logger_1.logger.error("Hyperion", "Load Commands", `Failed to load command ${e} from module ${this.name}. error: ${inspect(err)}`);
                    }
                }
            });
        }
        catch (err) {
            Logger_1.logger.error("Hyperion", "Load Commands", `Error loading commands for module ${this.name}: ${err}`);
        }
    }
    reloadCommands(Hyperion) {
        if (!this.hasCommands) {
            return;
        }
        const moduleCommands = Hyperion.commands.filter((c) => c.module === this.name);
        moduleCommands.forEach((cmd) => {
            Hyperion.commands.remove(cmd.id);
        });
        this.loadCommands(Hyperion);
    }
    //module setup, to be implemented by module
    // eslint-disable-next-line no-unused-vars
    init(Hyperion) {
    }
}
exports.Module = Module;
