"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../Core/Structures/Command");
class Bean extends Command_1.Command {
    constructor() {
        super({
            name: "bean",
            module: "fun",
            helpDetail: "Bean your friends!",
            helpUsage: "{prefix}bean [text]",
            helpUsageExample: "{prefix}bean @bean you got beaned!"
        });
    }
    // eslint-disable-next-line no-unused-vars
    async execute(ctx, Hyperion) {
        const data = {
            content: ctx.args.join(" "),
            embed: {
                title: "BEANED!!!",
                color: ctx.Hyperion.defaultColor,
                timestamp: new Date(),
                image: {
                    url: "https://cdn.discordapp.com/attachments/239446877953720321/333048272287432714/unknown.png"
                }
            }
        };
        return { status: { code: 0 }, payload: data };
    }
}
exports.default = Bean;
