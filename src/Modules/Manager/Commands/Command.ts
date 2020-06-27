import {Command as CommandConstructor} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion } from "../../../types";


class Command extends CommandConstructor{
    constructor(){
        super({
            name: "command",
            module: "manager",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Enabled disables, or sets additional settings for a command",
            helpUsage: "{prefix}command [command name]",
            helpUsageExample: "{prefix}command owoify"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify a command.";}
        const input = ctx.args[0].toLowerCase();
        const command = Hyperion.commands.find(c => (c.name === input || c.aliases.includes(input)) && (!c.dev && !c.contrib && !c.internal && !c.support && !c.unlisted));
        if(!command){return "Im not sure what command that is.";}
        if(!ctx.args[1]){
            const commandStatus = Hyperion.managers.guild.getCommandState(ctx.guild.id, command.name);
        }
        return "fuck off ts";
        
    }
}
export default Command;