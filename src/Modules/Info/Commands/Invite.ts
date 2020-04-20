import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";

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

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        const data = {
            embed: {
                timestamp: new Date(),
                color: Hyperion.defaultColor,
                author: {
                    name: "Hyperion Invite",
                    icon_url: Hyperion.client.user.avatarURL
                },
                description: "[You can invite Hyperion Here!](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&permissions=939912310&scope=bot)"
            }
        };
        return data;
    }
}
export default Invite;