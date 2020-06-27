import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";


class Prefix extends Command{
    constructor(){
        super({
            name: "prefix",
            module: "manager",
            userperms: ["manager"],

            helpDetail: "Changes the prefix for the server.",
            helpUsage: "{prefix}prefix [new prefix]",
            helpUsageExample: "{prefix}prefix %%"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){
            return `The current prefix is \`${ctx.guildConfig.prefix}\``;
        }
        if(ctx.args[0].length > 8){return "That prefix is too long, it must be lower than 8 characters!";}
        try{
            await Hyperion.managers.guild.setPrefix(ctx.guild.id, ctx.args[0]);
        }catch{
            return "Something went wrong!";
        }
        return `Prefix changed to \`${ctx.args[0]}\``;
    }
}
export default Prefix;