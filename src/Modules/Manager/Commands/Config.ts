import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext} from "../../../types";
import {ConfigOp, ConfigKeys, configurableModules} from "../Module/ConfigHelper";
import { Module } from "../../../Core/Structures/Module";



class Config extends Command{
    constructor(){
        super({
            name: "config",
            module: "internal",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Configures bot settings for the server",
            helpUsage: "{prefix}config - shows configurable modules\n{prefix}config [module] - shows settings for the module\n{prefix}config [module] [setting] - shows operations possible for that setting\n{prefix}config [module] [setting] [operation] [value] - changes a setting",
            helpUsageExample: "{prefix}config\n{prefix}config starboard\n{prefix}config starboard starchannel\n{prefix}config starboard starchannel set #starboard"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(!ctx.args[0]){
            return this.listModules(ctx, Hyperion);
        }
    }

    listModules(ctx: CommandContext, Hyperion: HyperionInterface){
        const confMods = configurableModules(Hyperion.modules).map((m: Module) => m.friendlyName);

        const data = {
            embed: {
                title: "Hyperion Configuration",
                color: Hyperion.defaultColor,
                description: `To see the settings for a module, run ${ctx.guildConfig.prefix}config [Module Name]\nThe modules that can be configured are listed below.\n\`\`\`${confMods.join(" \n")}\`\`\``,
                timestamp: new Date
            }
        };
        return data;
    }

    listKeys(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    listOps(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    doOp(ctx: CommandContext, Hyperion: HyperionInterface){

    }



    validateModule(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    validateKey(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    validateOp(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    validateSet(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    validateAdd(ctx: CommandContext, Hyperion: HyperionInterface){

    }

    validateRemove(ctx: CommandContext, Hyperion: HyperionInterface){

    }
}
export default Config;