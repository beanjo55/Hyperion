import {Command} from "../../../Core/Structures/Command";
import {exec} from "child_process";
import {inspect} from "util";
import { ICommandContext, IHyperion } from "../../../types";

class Exec extends Command{
    constructor(){
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | void>{
        
        try{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            exec(ctx.args.join(" "), (error: any, stdout: any) => {
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
            
        }catch(err){
            return "Something went wrong";
        }
        
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _getMaxDepth(toInspect: any, toEval: any): number | undefined{
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
export default Exec;