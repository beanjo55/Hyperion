import {Command} from "../../../Core/Structures/Command";
import {CommandResponse, EmbedResponse, ICommandContext, IHyperion} from "../../../types";
import {default as hl} from "../Highlights";

class Highlights extends Command{
    constructor(){
        super({
            name: "highlights",
            module: "highlights",
            aliases: ["highlight"],
            helpDetail: "Manages your highlights - DM notifications for certain words said while you are away",
            helpUsage: "{prefix}highlights\n{prefix}highlights add [word]\n{prefix}highlights remove [word]",
            helpUsageExample: "{prefix}highlights add sally\n{prefix}highlights remove banana"
        });
    }

    async execute(ctx: ICommandContext<hl>, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){
            const list = await ctx.module.getUserHighlights(ctx.user.id, ctx.guild.id);
            const data: EmbedResponse = {
                embed: {
                    title: "Your Highlights",
                    color: Hyperion.colors.default,
                    timestamp: new Date,
                    description: list.join("\n")
                }
            };
            return data;
        }
        if(ctx.args[0].toLowerCase() === "add"){
            if(!ctx.args[1]){return "Please specify a word to add";}
            if(ctx.args[1].length < 4){return "Highlights must be at least 4 letters";}
            try{
                await ctx.module.addUserHighlight(ctx.user.id, ctx.guild.id, ctx.args[1].toLowerCase());
                return "Successfully added highlight!";
            }catch(err){
                return err.message;
            }
        }

        if(ctx.args[0].toLowerCase() === "remove"){
            if(!ctx.args[1]){return "Please specify a word to remove";}
            try{
                await ctx.module.removeUserHighlight(ctx.user.id, ctx.guild.id, ctx.args[1].toLowerCase());
                return "Successfully removed highlight!";
            }catch(err){
                return err.message;
            }
        }
        return "Im not sure what option that is, try `add` or `remove`";
    }
}
export default Highlights;