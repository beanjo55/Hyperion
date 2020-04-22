import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";

class Data extends Command{
    constructor(){
        super({
            name: "data",
            module: "internal",
            internal: true,
            alwaysEnabled: true,
            admin: true,

            helpDetail: "Gets data on a guild",
            helpUsage: "{prefix}data [guildID]",
            noExample: true
        });
    }

    // eslint-disable-next-line no-unused-vars
    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        return "stub";
    }
}
export default Data;