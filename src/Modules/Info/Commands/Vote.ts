import {Command} from "../../../Core/Structures/Command";
import {CommandContext, HyperionInterface} from "../../../types";
import { Embed } from "eris";

class Vote extends Command{
    constructor(){
        super({
            name: "vote",
            module: "info",

            helpDetail: "Various places you can show your support on",
            helpUsage: "{prefix}vote",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>}>{
        return {
            embed: {
                color: Hyperion.defaultColor,
                timestamp: new Date,
                title: "Vote for Hyperion!",
                description: "[Top.gg](https://top.gg/bot/633056645194317825/vote)\n[Discord Boats](https://discord.boats/bot/633056645194317825/vote)\n[Glenn Bot List](https://glennbotlist.xyz/bot/633056645194317825/vote)",
                footer: {
                    text: "Thank you for supporting Hyperion!"
                }
            }
        };
    }
}
export default Vote;