"use strict";
class CommandContext {
    constructor(data) {
        this.msg = data.msg;
        this.guild = data.guild;
        this.channel = data.channel;
        this.member = data.memeber;
        this.userdata = data.userdata;
        this.guildconf = data.guildconf;
        this.level = 0;
        this.dev = false;
        this.admin = false;
        this.command = null;
        this.args = [];
    }
}
exports.struct = CommandContext;
