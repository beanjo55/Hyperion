import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../../../types";


class Starconf extends Command{
    constructor(){
        super({
            name: "starconf",
            module: "starboard",
            userperms: ["manager"],

            helpDetail: "Configures starboard settings",
            helpUsage: "{prefix}starconf channel [channel]\n{prefix}starconf ignoredchannels [channel]\n{prefix}starconf disable",
            helpUsageExample: "{prefix}starconf channel #starboard\n{prefix}starconf ignoredchannels #staff\n{prefix}starconf disable"
        });
    }

    async execute(ctx: any, Hyperion: HyperionInterface){

    }
}
export default Starconf;