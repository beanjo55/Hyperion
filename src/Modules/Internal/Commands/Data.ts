import {Command} from "../../../Core/Structures/Command";

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


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<string>{
        return "stub";
    }
}
export default Data;