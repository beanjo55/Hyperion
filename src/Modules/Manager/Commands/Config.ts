import Command from "../../../Structures/Command";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import { Embed } from "eris";
import Module, { configKey } from "../../../Structures/Module";

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
        if(!resolved){
            return {success: false, content: ctx.t("config.module404"), literal: true};
        }
        ctx.args = resolved.newArgs;
        if(resolved && !ctx.args[1]){
            return this.listKeys(ctx, resolved.mod);
        }
        
        const keyResolved = this.resolveKey(ctx, resolved.mod);
        if(!keyResolved){
            return {success: false, content: ctx.t("config.key404"), literal: true};
        }
        ctx.args = keyResolved.newArgs;
        if(keyResolved && !ctx.args[2]){
            return this.keyInfo(ctx, resolved.mod, keyResolved.key);
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

    keyInfo(ctx: CommandContext, mod: Module<unknown>, key: configKey): CommandResponse {
        let description = key.name + " " + ctx.t("isa") + " ";
        if(key.array){
            description += ctx.t("listof") + " " +  ctx.t(`config.types.${key.type}s`);
        }else{
            description += + ctx.t(`config.types.${key.type}`);
        }
        description += "\n";
        description += "**" + this.Hyperion.utils.toCap(ctx.t("description")) + ": **";
        description += ctx.t(key.langName) + "\n";
        description += "**" + ctx.t("config.keyinfo.cv") + ":** ";
        if(key.format){
            description += key.format(ctx.config[mod.name][key.key] ?? key.default) + "\n";
        }else{
            if(key.array){
                description += this.defaultArrayFormatter(ctx.config[mod.name][key.key] ?? [], key.type) + "\n";
            }else{
                description += this.defaultFormatter(ctx.config[mod.name][key.key] ?? key.default, key.type) + "\n";
            }
        }
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: ctx.t("config.keyinfo.title", [key.name]),
                color: this.Hyperion.colors.default,
                timestamp: new Date,
                description
            }
        };
        return {success: true, content: data, literal: true};
    }

    resolveModule(ctx: CommandContext): {newArgs: Array<string>; mod: Module<unknown>} | null {
        const resolved = this.Hyperion.utils.multiArg(ctx.args, this.filterModules(ctx).map(m => m.friendlyName));
        if(!resolved){return null;}
        const mod = [...this.Hyperion.modules.values()].find(m => m.friendlyName.split(" ").join("").toLowerCase() === resolved.match);
        if(!mod){return null;}
        const newArgs = [mod.name].concat(ctx.args.slice(resolved.offset+1));
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

    resolveKey(ctx: CommandContext, mod: Module<unknown>): {newArgs: Array<string>, key: configKey} | null {
        let names: Array<string> = [];
        [...mod.configKeys!.values()].map(k => {
            const newarr = k.aliases ?? [];
            newarr.push(k.name);
            return newarr;
        }).forEach(n => names = names.concat([...n.values()]));
        const resolved = this.Hyperion.utils.multiArg(ctx.args.slice(1), names);
        if(!resolved){return null;}
        const key = [...mod.configKeys!.values()].find(k => k.name === resolved.match || k.aliases?.includes(resolved.match));
        if(!key){return null;}
        let newArgs: Array<string> = [];
        newArgs = newArgs.concat(ctx.args[0]).concat([key.name]).concat(ctx.args.slice(resolved.offset + 2));
        return {key, newArgs};
    }

    defaultChannelFormatter(input: string): string {
        return `<#${input}>`;
    }

    defaultRoleFormatter(input: string): string {
        return `<@&${input}>`;
    }

    defaultUserFormatter(input: string): string {
        return `<@${input}>`;
    }

    defaultFormatter(input: string | number, type: "number" | "string" | "role" | "user" | "channel"): string {
        switch(type){
        case "role": {
            return this.defaultRoleFormatter(input as string);
        }
        case "channel": {
            return this.defaultChannelFormatter(input as string);
        }
        case "user": {
            return this.defaultUserFormatter(input as string);
        }
        case "number": {
            return input.toString();
        }
        case "string":
        default: {
            return input as string;
        }
        }
    }

    defaultArrayFormatter(input: Array<string | number>, type: "number" | "string" | "role" | "user" | "channel"): string {
        if(!input || input.length === 0){return "None";}
        switch(type){
        case "role": {
            return (input as Array<string>).map(ele => this.defaultRoleFormatter(ele)).join(", ");
        }
        case "channel": {
            return (input as Array<string>).map(ele => this.defaultChannelFormatter(ele)).join(", ");
        }
        case "user": {
            return (input as Array<string>).map(ele => this.defaultUserFormatter(ele)).join(", ");
        }
        case "number": {
            return (input as Array<number>).map(ele => ele.toString()).join(", ");
        }
        case "string":
        default: {
            return (input as Array<string>).join(", ");
        }
        }
    }
}