"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const guildmodel = require("../../MongoDB/Guild.js").default;
class MongoGuildManager {
    constructor() {
        this.model = guildmodel;
    }
    async createConfig(guildID) {
        return await this.model.create({ guild: guildID });
    }
    async getConfig(guildID) {
        if (await this.model.exists({ guild: guildID })) {
            return await this.model.findOne({ guild: guildID }).lean().exec();
        }
        else {
            return await this.createConfig(guildID);
        }
    }
    validateModuleState(state, module, modules) {
        const mod = modules.get(module);
        if (mod === undefined) {
            return { code: 1, payload: "No matching module found" };
        }
        if (mod.private) {
            return { code: 1, payload: "Module is private and not stored in config" };
        }
        if (!state && mod.alwaysEnabled) {
            return { code: 1, payload: "This module is always enabled and may not be disabled" };
        }
        return { code: 0, payload: new ModuleConfig({ enabled: state }) };
    }
    validateCommandState(data, command, commands) {
        const cmd = commands.get(command);
        if (!cmd) {
            return { code: 1, payload: "Invalid command" };
        }
        const cmdConfig = new CommandConfig(data);
        if (!cmdConfig.enabled && cmd.alwaysEnabled) {
            return { code: 1, payload: "This command can not be disabled" };
        }
        if (cmd.internal || cmd.dev || cmd.admin || cmd.support) {
            return { code: 1, payload: "This command is private and can not be configured per server" };
        }
        return { code: 0, payload: new CommandConfig(data) };
    }
    async updateModuleStates(guildID, newMod, newState, modules) {
        let guilddata = await this.model.findOne({ guild: guildID }, "modules").lean().exec();
        if (!guilddata.modules) {
            return { code: 1, payload: "An error occured" };
        }
        const validated = this.validateModuleState(newState, newMod, modules);
        if (validated.code !== 0) {
            return validated;
        }
        guilddata.modules[newMod] = validated.payload;
        return await this.model.updateOne({ guild: guildID }, { modules: guilddata.modules }).exec();
    }
    async updateCommands(guildID, newCmd, data, commands) {
        let guilddata = await this.model.findOne({ guild: guildID }, "commands").lean().exec();
        if (!guilddata.commands) {
            return { code: 1, payload: "An error occured" };
        }
        const merged = this.merge(guilddata[newCmd], data);
        const validated = this.validateCommandState(merged, newCmd, commands);
        if (validated.code !== 0) {
            return validated;
        }
        guilddata.commands[newCmd] = validated.payload;
        return await this.model.updateOne({ guild: guildID }, { commands: guilddata.commands }).exec();
    }
    async updateModuleConfig(guildID, mod, data) {
        if (!Object.getOwnPropertyNames(nameConfigMap).includes(mod)) {
            return { code: 1, payload: "No matching module found" };
        }
        let guilddata = await this.model.findOne({ guild: guildID }, mod).lean().exec();
        if (!guilddata[mod]) {
            return { code: 1, payload: "An error occured" };
        }
        let merged = this.merge(guilddata[mod], data);
        const validated = new nameConfigMap[mod](merged);
        let update = {};
        update[mod] = validated;
        return await this.model.updateOne({ guild: guildID }, update).exec();
    }
    async update(guildID, update) {
        return await this.model.updateOne({ guild: guildID }, update).exec();
    }
    merge(oldData, newData) {
        const newProps = Object.getOwnPropertyNames(newData);
        newProps.forEach((prop) => {
            oldData[prop] = newData[prop];
        });
        return oldData;
    }
}
exports.manager = MongoGuildManager;
class CommandConfig {
    constructor(data) {
        var _a, _b, _c, _d, _e;
        this.enabled = (_a = data.enabled) !== null && _a !== void 0 ? _a : true;
        this.allowedRoles = (_b = data.allowedRoles) !== null && _b !== void 0 ? _b : [];
        this.disabledRoles = (_c = data.disabledRoles) !== null && _c !== void 0 ? _c : [];
        this.allowedChannels = (_d = data.allowedChannels) !== null && _d !== void 0 ? _d : [];
        this.disabledChannels = (_e = data.allowedChannels) !== null && _e !== void 0 ? _e : [];
        if (data.subcommands !== undefined) {
            this.subcommands = data.subcommands;
        }
    }
}
class ModuleConfig {
    constructor(data) {
        this.enabled = data.enabled;
    }
}
class ModConfig {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.modRoles = (_a = data.modRoles) !== null && _a !== void 0 ? _a : [];
        this.protectedRoles = (_b = data.protectedRoles) !== null && _b !== void 0 ? _b : [];
        this.deleteAfter = (_c = data.deleteAfter) !== null && _c !== void 0 ? _c : -1;
        this.modLogChannel = (_d = data.modLogChannel) !== null && _d !== void 0 ? _d : "";
        this.requireReason = (_e = data.requireReason) !== null && _e !== void 0 ? _e : false;
        this.requireMuteTime = (_f = data.requireMuteTime) !== null && _f !== void 0 ? _f : false;
        this.deleteOnBan = (_g = data.deleteOnBan) !== null && _g !== void 0 ? _g : true;
        this.deleteCommand = (_h = data.deleteCommand) !== null && _h !== void 0 ? _h : false;
    }
}
class StarboardConfig {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f;
        this.starChannel = (_a = data.starChannel) !== null && _a !== void 0 ? _a : "";
        this.ignoredChannels = (_b = data.ignoredChannels) !== null && _b !== void 0 ? _b : [];
        this.ignoredRoles = (_c = data.ignoredRoles) !== null && _c !== void 0 ? _c : [];
        this.selfStar = (_d = data.selfStar) !== null && _d !== void 0 ? _d : false;
        this.customStar = (_e = data.customStar) !== null && _e !== void 0 ? _e : "";
        this.starCount = (_f = data.starCount) !== null && _f !== void 0 ? _f : 3;
    }
}
class LoggingConfig {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        this.logChannel = (_a = data.logChannel) !== null && _a !== void 0 ? _a : "";
        this.ghostReactTime = (_b = data.ghostReactTime) !== null && _b !== void 0 ? _b : 3;
        this.ignoredChannels = (_c = data.ignoredChannels) !== null && _c !== void 0 ? _c : [];
        this.ignoredRoles = (_d = data.ignoredRoles) !== null && _d !== void 0 ? _d : [];
        this.specifyChannels = (_e = data.specifyChannels) !== null && _e !== void 0 ? _e : false;
        this.banAdd = (_f = data.banAdd) !== null && _f !== void 0 ? _f : { enabled: false, channel: "default" };
        this.banRemove = (_g = data.banRemove) !== null && _g !== void 0 ? _g : { enabled: false, channel: "default" };
        this.memberAdd = (_h = data.memberAdd) !== null && _h !== void 0 ? _h : { enabled: false, channel: "default" };
        this.memberRemove = (_j = data.memberRemove) !== null && _j !== void 0 ? _j : { enabled: false, channel: "default" };
        this.messageDelete = (_k = data.messageDelete) !== null && _k !== void 0 ? _k : { enabled: false, channel: "default" };
        this.messageEdit = (_l = data.messageEdit) !== null && _l !== void 0 ? _l : { enabled: false, channel: "default" };
        this.bulkDelete = (_m = data.bulkDelete) !== null && _m !== void 0 ? _m : { enabled: false, channel: "default" };
        this.roleAdd = (_o = data.roleAdd) !== null && _o !== void 0 ? _o : { enabled: false, channel: "default" };
        this.roleUpdate = (_p = data.roleUpdate) !== null && _p !== void 0 ? _p : { enabled: false, channel: "default" };
        this.roleDelete = (_q = data.roleDelete) !== null && _q !== void 0 ? _q : { enabled: false, channel: "default" };
        this.channelAdd = (_r = data.channelAdd) !== null && _r !== void 0 ? _r : { enabled: false, channel: "default" };
        this.channelUpdate = (_s = data.channelUpdate) !== null && _s !== void 0 ? _s : { enabled: false, channel: "default" };
        this.channelDelete = (_t = data.channelDelete) !== null && _t !== void 0 ? _t : { enabled: false, channel: "default" };
        this.memberRoleAdd = (_u = data.memberRoleAdd) !== null && _u !== void 0 ? _u : { enabled: false, channel: "default" };
        this.memberRoleRemove = (_v = data.memberRoleRemove) !== null && _v !== void 0 ? _v : { enabled: false, channel: "default" };
        this.memberNicknameChange = (_w = data.memberNicknameChange) !== null && _w !== void 0 ? _w : { enabled: false, channel: "default" };
        this.voiceJoin = (_x = data.voiceJoin) !== null && _x !== void 0 ? _x : { enabled: false, channel: "default" };
        this.voiceSwitch = (_y = data.voiceSwitch) !== null && _y !== void 0 ? _y : { enabled: false, channel: "default" };
        this.voiceLeave = (_z = data.voiceLeave) !== null && _z !== void 0 ? _z : { enabled: false, channel: "default" };
        this.guildUpdate = (_0 = data.guildUpdate) !== null && _0 !== void 0 ? _0 : { enabled: false, channel: "default" };
        this.webhookUpdate = (_1 = data.webhookUpdate) !== null && _1 !== void 0 ? _1 : { enabled: false, channel: "default" };
        this.ghostReact = (_2 = data.ghostReact) !== null && _2 !== void 0 ? _2 : { enabled: false, channel: "default" };
    }
}
class WelcomeConfig {
    constructor(data) {
        var _a, _b, _c, _d;
        this.content = (_a = data.content) !== null && _a !== void 0 ? _a : "";
        this.channel = (_b = data.channel) !== null && _b !== void 0 ? _b : "";
        this.messageType = (_c = data.messageType) !== null && _c !== void 0 ? _c : "text";
        this.dm = (_d = data.dm) !== null && _d !== void 0 ? _d : false;
    }
}
class TagConfig {
    constructor(data) {
        var _a, _b, _c, _d;
        this.allowedEditRoles = (_a = data.allowedEditRoles) !== null && _a !== void 0 ? _a : [];
        this.limitEdit = (_b = data.limitEdit) !== null && _b !== void 0 ? _b : false;
        this.delete = (_c = data.delete) !== null && _c !== void 0 ? _c : false;
        this.tags = (_d = data.tags) !== null && _d !== void 0 ? _d : [];
    }
}
class RankConfig {
    constructor(data) {
        var _a, _b, _c, _d;
        this.limitOne = (_a = data.limitOne) !== null && _a !== void 0 ? _a : false;
        this.limitOnePerGroup = (_b = data.limitOnePerGroup) !== null && _b !== void 0 ? _b : false;
        this.ranks = (_c = data.ranks) !== null && _c !== void 0 ? _c : {};
        this.rankGroups = (_d = data.rankGroups) !== null && _d !== void 0 ? _d : {};
    }
}
class RRConfig {
    constructor(data) {
        var _a, _b, _c, _d;
        this.limitOne = (_a = data.limitOne) !== null && _a !== void 0 ? _a : false;
        this.limitOnePerGroup = (_b = data.limitOnePerGroup) !== null && _b !== void 0 ? _b : false;
        this.rr = (_c = data.rr) !== null && _c !== void 0 ? _c : {};
        this.rrGroups = (_d = data.rrGroups) !== null && _d !== void 0 ? _d : {};
    }
}
class AutoroleConfig {
    constructor(data) {
        var _a, _b;
        this.autoroles = (_a = data.autoroles) !== null && _a !== void 0 ? _a : {};
        this.removePrevious = (_b = data.removePrevious) !== null && _b !== void 0 ? _b : false;
    }
}
class SocialConfig {
    constructor(data) {
        var _a, _b;
        this.ignoredChannels = (_a = data.ignoredChannels) !== null && _a !== void 0 ? _a : [];
        this.levelupChannel = (_b = data.levelupChannel) !== null && _b !== void 0 ? _b : "";
    }
}
const nameConfigMap = {
    mod: ModConfig,
    command: CommandConfig,
    module: ModuleConfig,
    logging: LoggingConfig,
    tags: TagConfig,
    welcome: WelcomeConfig,
    starboard: StarboardConfig,
    rank: RankConfig,
    rr: RRConfig,
    social: SocialConfig,
    autorole: AutoroleConfig
};
