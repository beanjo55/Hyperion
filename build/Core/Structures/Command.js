"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
class Command {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        this.name = (_a = data.name) !== null && _a !== void 0 ? _a : "dummy";
        this.id = this.name;
        this.module = (_b = data.module) !== null && _b !== void 0 ? _b : "default";
        this.aliases = (_c = data.aliases) !== null && _c !== void 0 ? _c : [];
        this.internal = (_d = data.internal) !== null && _d !== void 0 ? _d : false;
        this.alwaysEnabled = (_e = data.alwaysEnabled) !== null && _e !== void 0 ? _e : false;
        this.userperms = (_f = data.userperms) !== null && _f !== void 0 ? _f : [];
        this.botperms = (_g = data.botperms) !== null && _g !== void 0 ? _g : [];
        this.needsRolepos = (_h = data.needsRolepos) !== null && _h !== void 0 ? _h : false;
        this.dev = (_j = data.dev) !== null && _j !== void 0 ? _j : false;
        this.admin = (_k = data.admin) !== null && _k !== void 0 ? _k : false;
        this.support = (_l = data.support) !== null && _l !== void 0 ? _l : false;
        this.cooldownTime = (_m = data.cooldownTime) !== null && _m !== void 0 ? _m : 2000;
        this.helpDetail = (_o = data.helpDetail) !== null && _o !== void 0 ? _o : "dummy";
        this.helpAliases = (_p = data.helpAliases) !== null && _p !== void 0 ? _p : "dummy";
        this.helpSubcommands = (_q = data.helpSubcommands) !== null && _q !== void 0 ? _q : "dummy";
        this.helpUsage = (_r = data.helpUsage) !== null && _r !== void 0 ? _r : "dummy";
        this.helpUsageExample = (_s = data.helpUsageExample) !== null && _s !== void 0 ? _s : "dummy";
        this.noExample = (_t = data.noExample) !== null && _t !== void 0 ? _t : false;
        this.hasSub = (_u = data.hasSub) !== null && _u !== void 0 ? _u : false;
        this.selfResponse = (_v = data.selfResponse) !== null && _v !== void 0 ? _v : false;
        this.subcommands = new eris_1.Collection(Command);
    }
    //dummy default command 
    // eslint-disable-next-line no-unused-vars
    async execute(ctx, Hyperion) {
        throw new Error("Unimplemented command!");
    }
}
exports.Command = Command;
