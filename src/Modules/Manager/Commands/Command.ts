import {Command as command} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion } from "../../../types";


class Command extends command{
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

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "please specify a command to toggle";}
        const name = ctx.args[0].toLowerCase();
        let cmd = Hyperion.commands.get(name);
        if(!cmd){
            cmd = Hyperion.commands.find((c: command) => c.aliases.includes(name));
        }
        if(!cmd){return "I couldnt find a command by that name";}
        if(cmd.alwaysEnabled){return "This command is always enabled for diagnostic and internal reasons, it may not be disabled";}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if(ctx.guildConfig && ctx.guildConfig.commands && (ctx.guildConfig.commands as any)[cmd.name]){
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = !(ctx.guildConfig.commands as any)[cmd.name].enabled;
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, cmd.name, {enabled: state}, Hyperion.commands);
            }catch(err){
                Hyperion.logger.error("Hyperion", `Error toggling command, error: ${err}`, "Command toggle");
                return "Something went wrong";
            }
            return "Success!";
        }
        try{
            await Hyperion.managers.guild.updateCommands(ctx.guild.id, cmd.name, {enabled: false}, Hyperion.commands);
        }catch(err){
            Hyperion.logger.error("Hyperion", `Error toggling command, error: ${err}`, "Command toggle");
            return "Something went wrong";
        }
        return "Success!";
        
    }
}
export default Command;