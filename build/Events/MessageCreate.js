"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const { inspect } = require("util");
class MessageCreateHandler {
    constructor() {
        this.name = "messageCreate";
    }
    async handle(msg) {
        if (msg.channel.type !== 0) {
            return;
        }
        let guild = msg.channel.guild;
        if (msg.author.bot) {
            return;
        }
        this.handler(msg);
        //msg.channel.createMessage("```js\n" + inspect(await this.handler(msg), {depth: 1}) + "```");
    }
}
exports.event = new MessageCreateHandler;
