/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {HyperionInterface, CommandContext} from "../../../types";
import {exec} from "child_process";

class Restart extends Command{
    constructor(){
        super({
            name: "restart",
            module: "internal",
            aliases: ["r"],
            internal: true,
            alwaysEnabled: true,
            admin: true,
            selfResponse: true,

            helpDetail: "Restarts the bot",
            helpUsage: "{prefix}restart",
            noExample: true
        });
    }


    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<void>{
        await ctx.channel.createMessage("Restarting").catch(() => {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exec("pm2 restart 0", (error: any, stdout: any) => {});
    }
}
export default Restart;