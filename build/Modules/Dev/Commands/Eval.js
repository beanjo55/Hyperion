"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../Core/Structures/Command");
const { inspect } = require("util");
class Eval extends Command_1.Command {
    constructor() {
        super({
            name: "eval",
            module: "dev",
            aliases: ["e", "evaluate"],
            internal: true,
            alwaysEnabled: true,
            dev: true,
            hasSub: true,
            helpDetail: "Evaluates JavaScript code",
            helpSubcommands: "{prefix}eval async - Evaluates JavaScript code in an async context",
            helpUsage: "{prefix}eval code\n{prefix}eval async code",
            helpUsageExample: "{prefix}eval 1 + 1\n{prefix}eval async return 1 + 1"
        });
    }
    async execute(ctx, Hyperion) {
        //console.log(ctx.args)
        const code = ctx.args.join(" ");
        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") {
                evaled = inspect(evaled, { depth: 0 });
            }
            return { status: { code: 0 }, payload: await this.evalresult(ctx, evaled, Hyperion) };
        }
        catch (err) {
            return { status: { code: 0 }, payload: await this.evalerror(ctx, err, Hyperion) };
        }
    }
    async clean(text, ctx, Hyperion) {
        const rx = new RegExp(Hyperion.client.token, "gim");
        if (typeof (text) === "string") {
            text = text.replace(rx, "Fuck You");
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        }
        else {
            return text;
        }
    }
    async evalresult(ctx, result, Hyperion) {
        const output = await this.clean(result, ctx, Hyperion);
        if (output.length > 1990) {
            return "The output was too long, it was sent to the console log";
        }
        const data = {
            embed: {
                author: { name: "Eval Results", icon_url: ctx.user.avatarURL },
                description: "```js\n" + output + "```",
                color: ctx.Hyperion.defaultColor,
                timestamp: new Date()
            }
        };
        return data;
    }
    async evalerror(ctx, result, Hyperion) {
        return "`ERROR`\n```xl\n" + await this.clean(result, ctx, Hyperion) + "```";
    }
}
class AsyncEval extends Eval {
    constructor() {
        super();
        this.name = "async";
        this.id = this.name;
        this.aliases = ["a"];
    }
    async execute(ctx, Hyperion) {
        const code = "async function run(ctx){" + ctx.args.slice(1).join(" ") + "}; run(ctx)";
        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") {
                evaled = inspect(evaled, { depth: 0 });
            }
            return { status: { code: 0 }, payload: await this.evalresult(ctx, evaled, Hyperion) };
        }
        catch (err) {
            return { status: { code: 0 }, payload: await this.evalerror(ctx, err, Hyperion) };
        }
    }
}
const subarr = [AsyncEval];
exports.subcmd = subarr;
exports.default = Eval;
