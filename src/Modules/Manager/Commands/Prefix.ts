import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";


class Prefix extends Command{
    constructor(){
        super({
            name: "prefix",
            module: "manager",
            userperms: ["manager"],

            helpDetail: "Changes the prefix for the server",
            helpUsage: "{prefix}prefix [new prefix]",
            helpUsageExample: "{prefix}prefix %%"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(!ctx.args[0]){
            return `The current prefix is \`${ctx.guildConfig.prefix}\``;
        }
        try{
            await Hyperion.managers.guild.setPrefix(ctx.guild.id, ctx.args[0]);
        }catch{
            return "Something went wrong";
        }
        return `Prefix changed to \`${ctx.args[0]}\``;
    }
}
export default Prefix;