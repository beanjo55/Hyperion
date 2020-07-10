import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";


class Prefix extends Command{
    constructor(){
        super({
            name: "prefix",
            module: "manager",
            userperms: ["manager"],

            helpDetail: "Changes the prefix for the server or toggle the casual prefix.",
            helpUsage: "{prefix}prefix [new prefix]\n{prefix}prefix -casual [yes or no]",
            helpUsageExample: "{prefix}prefix %%\n{prefix}prefix -casual yes"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){
            return `The current prefix is \`${ctx.guildConfig.prefix}\``;
        }
        if(ctx.args[0].toLowerCase() === "-casual"){
            if(!ctx.args[1]){return "Please specify yes or no";}
            const result = Hyperion.utils.input2boolean(ctx.args[1]);
            if(result === undefined){return "Im not sure what that is, try yes or no";}
            try{
                Hyperion.managers.guild.update(ctx.guild.id, {casualPrefix: result});
                return result ? "Enabled casual prefix" : "Disabled casual prefix";
            }catch(err){
                return err.message;
            }
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