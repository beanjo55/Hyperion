import {Command} from "../../../Structures/Command";
import {Module as module} from "../../../Structures/Module";
import {ICommandContext, IHyperion} from "../../../types";
import { Embed } from "eris";
import {default as manager} from "../Manager";

const rx1 = new RegExp("true", "gm");
const rx2 = new RegExp("false", "gm");

class Module extends Command{
    constructor(){
        super({
            name: "module",
            module: "manager",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Lists all the toggleable modules, or toggles a module",
            helpUsage: "{prefix}module\n{prefix}module [module name]",
            helpUsageExample: "{prefix}module starboard"
        });
    }

    async execute(ctx: ICommandContext<manager>, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | string>{

        const toggleable = ctx.module.toggleableModules(Hyperion.modules, ctx.guildConfig.pro);
        const list = toggleable.map((m: module) => m.name.toLowerCase());
        let outlist: Array<string> = list;
        const fromconf: Array<string> = [];
        if(ctx.guildConfig && ctx.guildConfig.modules){
            outlist = [];
            const modulesconf = Object.getOwnPropertyNames(ctx.guildConfig.modules);
            modulesconf.forEach(m => {
                outlist.push(`${m} - ${(ctx.guildConfig.modules[m] as {enabled: boolean}).enabled}`);
                fromconf.push(m);
            });
            toggleable.forEach((t: module) => {
                if(!fromconf.includes(t.name)){
                    outlist.push(`${t.name} - ${t.defaultStatus}`);
                }
            });
        }
        if(!ctx.args[0]){
            const data = {
                embed: {
                    title: "Hyperion toggleable modules",
                    color: Hyperion.colors.default,
                    timestamp: new Date,
                    description: `The modules that you can toggle are listed below\n\`\`\`${outlist.join("\n").replace(rx1, "Enabled").replace(rx2, "Disabled")}\`\`\``
                }
            };
            return data;
        }
        const name = ctx.args[0].toLowerCase();
        if(!list.includes(name)){return "I can't find a toggleable module by that name!";}
        if(ctx.guildConfig && ctx.guildConfig.modules){
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if((ctx.guildConfig.modules as any)[name] !== undefined){
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const oldstate = (ctx.guildConfig.modules as any)[name].enabled;
                try{
                    await Hyperion.managers.guild.updateModuleStates(ctx.guild.id, name, !oldstate, Hyperion.modules);
                }catch(err){
                    Hyperion.logger.error("Hyperion", `error toggling ${name}, error: ${err}`, "Module toggle");
                    return "Something went wrong!";
                }
                return "Success!";
            }
        }
        const mod = Hyperion.modules.get(name);
        if(!mod){return "Invalid module provided!";}
        try{
            await Hyperion.managers.guild.updateModuleStates(ctx.guild.id, name, !mod.default, Hyperion.modules);
        }catch(err){
            Hyperion.logger.error("Hyperion", `error toggling ${name}, error: ${err}`, "Module toggle");
            return "Something went wrong!";
        }
        return "Success!";

    }
}
export default Module;