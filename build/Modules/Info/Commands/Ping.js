"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../Core/Structures/Command");
class Ping extends Command_1.Command {
    constructor() {
        super({
            name: "ping",
            module: "info",
            aliases: ["pong"],
            alwaysEnabled: true,
            selfResponse: true
        });
    }
    // eslint-disable-next-line no-unused-vars
    async execute(ctx, Hyperion) {
        return await ctx.channel.createMessage("Ping?").then((msg) => {
            return msg.edit(`Pong! ${msg.timestamp - ctx.msg.timestamp}ms`);
        });
    }
}
exports.default = Ping;
