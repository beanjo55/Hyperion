import hyperion from "../main";
import {default as fs} from "fs";
import { Message } from "eris";


export default class Module<T> {
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
    config?: (data: Partial<T>) => T;
    constructor(data: Partial<Module<T>>, Hyperion: hyperion){
        if(!data.name || !data.path || !data.dir){throw new Error("Missing name or path");}
        this.name = data.name;
        this.path = data.path;
        this.dir = data.dir;
        this.Hyperion = Hyperion;
        this.subscribedEvents = data.subscribedEvents ?? [];
        this.friendlyName = data.friendlyName ?? "New Module";
        this.private = data.private ?? false;
        this.pro = data.pro ?? false;
        this.hasCommands = data.hasCommands ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;
        if(data.config){this.config = data.config;}
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

    loadCommands(): number {
        let loaded = 0;
        try{
            const files = fs.readdirSync(this.commandDir);
            files.forEach(file => {
                try{
                    this.loadCommand(this.commandDir + file);
                    loaded++;
                }catch(err){
                    //logger
                }
            });
        }catch(err){
            //logger
        }
        return loaded;
    }

    loadCommand(path: string): void {
        const cmd = require(path).default;
        if(!cmd){throw new Error("Given command path gave an undefined result");}
        try{
            const loaded = new cmd(this.Hyperion);
            this.Hyperion.commands.set(loaded.name, loaded);
        }catch(err){
            //logger
        }

    }

    reloadCommand(path: string): void {
        delete require.cache[require.resolve(path)];
        const toLoad = require(path).default;
        if(!toLoad){throw new Error("Given command path gave an undefined result");}
        const loaded = new toLoad(this.Hyperion);
        this.Hyperion.commands.set(loaded.name, loaded);
    }

    

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    messageCreate(...args: [Message]): void {throw new Error("Unimplemented messageCreate");}
}