"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../Core/Structures/Command");
const { exec } = require("child_process");
const { inspect } = require("util");
class Exec extends Command_1.Command {
    constructor() {
        super({
            name: "exec",
            module: "dev",
            aliases: ["ex", "execute"],
            internal: true,
            alwaysEnabled: true,
            dev: true,
            selfResponse: true,
            helpDetail: "Executes a system command on the host system",
            helpUsage: "{prefix}execute systemcommand",
            helpUsageExample: "{prefix}execute git pull"
        });
    }
    async execute(ctx) {
        try {
            exec(ctx.args.join(" "), (error, stdout) => {
                const outputType = error || stdout;
                let output = outputType;
                if (typeof outputType === "object") {
                    output = inspect(outputType, {
                        depth: this._getMaxDepth(outputType, ctx.args.join(" "))
                    });
                }
                output = (output.length > 1980 ? output.substr(0, 1977) + "..." : output);
                output = "```" + output + "```";
                ctx.channel.createMessage(output);
            });
        }
        catch (err) {
            return { status: { code: 2, error: err }, payload: "Something went wrong" };
        }
    }
    _getMaxDepth(toInspect, toEval) {
        let maxDepth = 10;
        for (let i = 0; i < 10; i++) {
            if (inspect(toInspect, { depth: i }).length > (1980 - toEval.length)) {
                maxDepth = i - 1;
                return;
            }
        }
        return maxDepth;
    }
}
exports.default = Exec;
