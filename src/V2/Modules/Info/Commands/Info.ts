import {Command} from "../../../Structures/Command";
import {IHyperion, ICommandContext, EmbedResponse} from "../../../types";

class Info extends Command{
    constructor(){
        super({
            name: "info",
            module: "info",
            aliases: ["about", "botinfo"],
            helpDetail: "Shows basic bot info",
            helpUsage: "{prefix}info",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<EmbedResponse>{
        const data: EmbedResponse = {
            embed: {
                title: "Hyperion Info",
                timestamp: new Date,
                description: "A powerful multipurpose bot with an emphasis on customization",
                color: Hyperion.colors.default,
                thumbnail: {
                    url: Hyperion.client.user.avatarURL
                },
                fields: [
                    {
                        name: "Version",
                        value: Hyperion.version,
                        inline: true
                    },
                    {
                        name: "Commands",
                        value: Hyperion.commands.size.toString(),
                        inline: true
                    },
                    {
                        name: "Modules",
                        value: Hyperion.modules.size.toString(),
                        inline: true
                    },
                    {
                        name: "Developer",
                        value: "bean#8086",
                        inline: true
                    },
                    {
                        name: "Library",
                        value: "Eris",
                        inline: true
                    },
                    {
                        name: "Hosting",
                        value: "[Galaxy Gate VPS](https://billing.galaxygate.net/aff.php?aff=102)",
                        inline: true
                    },
                    {
                        name: "Invite",
                        value: "[Invite Hyperion here!](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&scope=bot&permissions=2110123134)",
                        inline: true
                    },
                    {
                        name: "Support",
                        value: "[Get support here!](https://discord.gg/Vd8vmBD)",
                        inline: true
                    }
                ]
            }
        };
        if(ctx.user.id === "253233185800847361"){
            data.embed.fields!.push({name: "Sally", value: "Cute", inline: true});
        }
        return data;
    }
}
export default Info;