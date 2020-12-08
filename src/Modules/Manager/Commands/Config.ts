import Command from "../../../Structures/Command";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import { Embed } from "eris";
import Module from "../../../Structures/Module";

export default class Config extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "config",
            module: "manager",
            aliases: ["settings", "configuration"],
            perms: "manager",
            cooldown: 3,
            help: {
                detail: `Configures ${Hyperion.name} in  your server`,
                usage: "{prefix}config"
            }
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        if(!ctx.args[0]){return this.listMods(ctx);}
        const resolved = this.resolveModule(ctx);
        if(resolved){
            return this.listKeys(ctx, resolved.mod);
        }
        return {success: true, content: "sally", literal: true};
    }

    listMods(ctx: CommandContext): CommandResponse {
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: ctx.t("config.modlist.title", [this.Hyperion.name]),
                description: ctx.t("config.modlist.header", [ctx.config.prefix]) + "```\n" + this.filterModules(ctx).map(m => m.friendlyName).join("\n") + "```",
                color: this.Hyperion.colors.default,
                timestamp: new Date
            }
        };
        return {success: true, content: data, literal: true};
    }

    listKeys(ctx: CommandContext, mod: Module<unknown>): CommandResponse {
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: ctx.t("config.keylist.title", [mod.friendlyName]),
                description: ctx.t("config.keylist.header", [mod.friendlyName, ctx.config.prefix]) + "\n```\n" + [...mod.configKeys!.values()].map(k => `${k.name} - ${ctx.t(k.langName)}`).join("\n") + "```",
                color: this.Hyperion.colors.default,
                timestamp: new Date
            }
        };
        return {success: true, content: data, literal: true};
    }

    resolveModule(ctx: CommandContext): {newArgs: Array<string>; mod: Module<unknown>} | null {
        const resolved = this.Hyperion.utils.multiArg(ctx.args, this.filterModules(ctx).map(m => m.friendlyName));
        if(!resolved){return null;}
        const mod = [...this.Hyperion.modules.values()].find(m => m.friendlyName.split(" ").join("").toLowerCase() === resolved.match);
        if(!mod){return null;}
        const newArgs = ctx.args.slice(resolved.offset);
        return {newArgs, mod};
    }

    filterModules(ctx: CommandContext): Array<Module<unknown>> {
        return [...this.Hyperion.modules.values()].filter(m => {
            if(m.private && !ctx.config.dev){return false;}
            if(m.pro && !(ctx.config.pro || ctx.config.dev)){return false;}
            if(!m.configKeys){return false;}
            return true;
        });
    }

    resolveKey(ctx: CommandContext, mod: Module<unknown>)
}