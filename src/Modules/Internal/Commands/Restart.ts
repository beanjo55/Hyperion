import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";
const { exec } = require("child_process");

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

    // eslint-disable-next-line no-unused-vars
    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        await ctx.channel.createMessage("Restarting").catch(() => {});
        // eslint-disable-next-line no-unused-vars
        exec("pm2 restart 0", (error: any, stdout: any) => {});
    }
}
export default Restart;