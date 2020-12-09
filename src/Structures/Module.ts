/* eslint-disable @typescript-eslint/no-unused-vars */
import hyperion, {GuildType} from "../main";
import {default as fs} from "fs";
import { Guild, Message } from "eris";
import Command from "./Command";


export default abstract class Module<T> {
    name: string;
    path: string;
    dir: string;
    Hyperion: hyperion;
    subscribedEvents: Array<string>;
    friendlyName: string;
    private: boolean;
    pro: boolean;
    hasCommands: boolean;
    alwaysEnabled: boolean;
    defaultState: boolean;
    config?: (data: Partial<T>) => T;
    configKeys?: Map<string, configKey>;
    constructor(data: Partial<Module<T>>, Hyperion: hyperion){
        if(!data.name || !data.path || !data.dir){throw new Error("Missing name or path");}
        this.name = data.name;
        this.path = data.path;
        this.dir = data.dir;
        this.Hyperion = Hyperion;
        this.subscribedEvents = data.subscribedEvents ?? [];
        this.friendlyName = data.friendlyName ?? this.name;
        this.private = data.private ?? false;
        this.pro = data.pro ?? false;
        this.hasCommands = data.hasCommands ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;
        this.defaultState = data.defaultState ?? true;
        if(data.config){
            this.config = data.config;
            this.configKeys = data.configKeys;
        }
    }

    formatConfig(data: Partial<T>): T{
        if(!this.config){throw new Error("Module has no config");}
        return this.config(data);
    }

    get commandDir(): string {
        return this.dir + "/Commands";
    }

    async onLoad(): Promise<boolean> {
        throw new Error("Unimplemented onLoad");
    }

    async onUnload(): Promise<boolean> {
        throw new Error("Unimplemented onUnoad");
    }

    loadCommands(): void {
        try{
            const files = fs.readdirSync(this.commandDir);
            files.forEach(file => {
                try{
                    this.loadCommand(this.commandDir + "/" + file);
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", "failed to load command from " + file + " err: " + err.message, "Command loading");
                }
            });
        }catch(err){
            this.Hyperion.logger.error("Hyperion", "failed to read commands for " + this.name, "Command loading");
        }
    }

    async loadCommand(path: string): Promise<void> {
        const cmd = require(path).default;
        if(!cmd){throw new Error("Given command path gave an undefined result");}
        try{
            const loaded: Command = new cmd(this.Hyperion, path);
            this.Hyperion.commands.set(loaded.name, loaded);
            if(loaded.hasSub){
                const subcmds = require(path).subcommands;
                loaded.subcommands = new Map<string, Command>();
                subcmds.forEach((sub: new (arg0: hyperion, arg1: string) => Command) => {
                    const newcmd: Command = new sub(this.Hyperion, path);
                    loaded.subcommands!.set(newcmd.name, newcmd);
                });
                const exists = await this.Hyperion.metadataModels.command.exists({name: loaded.name});
                if(exists){
                    this.Hyperion.metadataModels.command.updateOne({name: loaded.name}, {
                        alwaysEnabled: loaded.alwaysEnabled,
                        aliases: loaded.aliases,
                        perms: loaded.perms,
                        pro: loaded.pro,
                        private: loaded.private,
                        help: loaded.help,
                        cooldown: loaded.cooldown
                    });
                }else{
                    this.Hyperion.metadataModels.command.create({
                        name: loaded.name,
                        alwaysEnabled: loaded.alwaysEnabled,
                        aliases: loaded.aliases,
                        perms: loaded.perms,
                        pro: loaded.pro,
                        private: loaded.private,
                        help: loaded.help,
                        cooldown: loaded.cooldown
                    });
                }
            }
        }catch(err){
            this.Hyperion.logger.error("Hyperion", "failed to load command from " + path + " err: " + err.message, "Command loading");
        }

    }

    reloadCommand(path: string): void {
        delete require.cache[require.resolve(path)];
        const toLoad = require(path).default;
        if(!toLoad){throw new Error("Given command path gave an undefined result");}
        const loaded: Command = new toLoad(this.Hyperion, path);
        this.Hyperion.commands.set(loaded.name, loaded);
    }

    guildEnabled(config: GuildType): boolean {
        if(this.Hyperion.global.disabledModules.includes(this.name) && !config.dev){return false;}
        if(this.alwaysEnabled){return true;}
        if(this.private && !config.dev){return false;}
        if(this.pro && !(config.dev || config.pro)){return false;}
        if(config.modules[this.name] !== undefined){
            return config.modules[this.name];
        }
        return this.defaultState;
    }

    guildCommandEnabled(config: GuildType, priv: boolean): boolean {
        if(this.Hyperion.global.disabledModules.includes(this.name) && !priv){return false;}
        if(this.alwaysEnabled){return true;}
        if(priv){return true;}
        if(this.private && !config.dev){return false;}
        if(this.pro && !(config.dev || config.pro)){return false;}
        if(config.modules[this.name] !== undefined){
            return config.modules[this.name];
        }
        return this.defaultState;
    }

    messageCreate(...args: [Message]): void {throw new Error("Unimplemented messageCreate");}
    guildCreate(...args: [Guild]): void {throw new Error("Unimplemented guildCreate");}
    guildDelete(...args: [Guild]): void {throw new Error("Unimplemented guildDelete");}
}

export interface configKey {
    name: string;
    array: boolean;
    default: unknown;
    validate?: (data: unknown, input: unknown) => boolean;
    format?: (data: unknown) => string;
    key: string;
    needsBind?: boolean;
    type: "role" | "channel" | "user" | "number" | "string",
    langName: string;
    aliases?: Array<string>;
}