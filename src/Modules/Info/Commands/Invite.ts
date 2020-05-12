import {Command} from "../../../Core/Structures/Command";
import {CommandContext, HyperionInterface} from "../../../types";
import { Embed } from "eris";

class Invite extends Command{
    constructor(){
        super({
            name: "invite",
            module: "info",

            helpDetail: "Shows an invite for the bot",
            helpUsage: "{prefix}invite",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<{embed: Partial<Embed>}>{
        const data = {
            embed: {
                timestamp: new Date(),
                color: Hyperion.defaultColor,
                author: {
                    name: "Hyperion Invite",
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    icon_url: Hyperion.client.user.avatarURL
                },
                description: "[You can invite Hyperion Here!](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&permissions=939912310&scope=bot)"
            }
        };
        return data;
    }
}
export default Invite;