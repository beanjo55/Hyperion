import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import { CommandContext, HyperionInterface } from "../../../types";

class command extends Command{
    constructor(){
        super({
            name: "command",
            module: "manager",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Enabled or disables a command",
            helpUsage: "{prefix}command [command name]",
            helpUsageExample: "{prefix}command owoify"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(!ctx.args[0]){return "please specify a command to toggle";}
        let name = ctx.args[0].toLowerCase();
        let cmd = Hyperion.commands.get(name);
        if(!cmd){
            cmd = Hyperion.commands.find((c: Command) => c.aliases.includes(name));
        }
        if(!cmd){return "I couldnt find a command by that name";}
        if(cmd.alwaysEnabled){return "This command is always enabled for diagnostic and internal reasons, it may not be disabled";}
        if(ctx.guildConfig && ctx.guildConfig.commands && (ctx.guildConfig.commands as any)[cmd.name]){
            let state = !(ctx.guildConfig.commands as any)[cmd.name].enabled;
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, cmd.name, {enabled: state}, Hyperion.commands);
            }catch(err){
                Hyperion.logger.error("Hyperion", "Command toggle", `Error toggling command, error: ${err}`);
                return "Something went wrong";
            }
            return "Success!";
        }
        try{
            await Hyperion.managers.guild.updateCommands(ctx.guild.id, cmd.name, {enabled: false}, Hyperion.commands);
        }catch(err){
            Hyperion.logger.error("Hyperion", "Command toggle", `Error toggling command, error: ${err}`);
            return "Something went wrong";
        }
        return "Success!";
        
    }
}
export default command;