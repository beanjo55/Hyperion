/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";
import {exec} from "child_process";

class Restart extends Command{
    constructor(){
        super({
            name: "deactivate",
            module: "internal",
            aliases: [],
            internal: true,
            alwaysEnabled: true,
            admin: true,

            helpDetail: "Restarts the bot",
            helpUsage: "{prefix}restart",
            noExample: true
        });
    }


    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<void | string>{
        if(!ctx.args[0]){return "specify a guild to activate";}
        const exists = await Hyperion.models.guild.exists({guild: ctx.args[0]});
        if(!exists){return "Please enter a valid id, or add Hyperion to the server at least once";}
        try{
            await Hyperion.models.guild.updateOne({guild: ctx.args[0]}, {pro: true}).exec();
            Hyperion.client.executeWebhook("762851029481816085", "DERAC3OdKkpMnnYv9ybNpiUo6hj3OvRsenne0XJd_cEulDi5NWYC0WYFuqWsM8SDkQH6", {
                embeds: [{
                    title: "Guild Deactivated",
                    description: "**ID:** " + ctx.args[0],
                    fields: [
                        {name: "Deactivated By", value: `${ctx.user.username}#${ctx.user.discriminator} - ${ctx.user.id}`},
                        {name: "Notes", value: ctx.args.length >= 2 ? ctx.args.slice(2).join(" ") : "No Notes"}
                    ]
                }]
            });
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}
export default Restart;