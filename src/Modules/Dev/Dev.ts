import Module, { configKey } from "../../Structures/Module";
import hyperion from "../../main";
import { Guild } from "eris";
interface devConfig {sally: number; friends: Array<string>}

const keys: {[key: string]: configKey} = {
    "sally": {
        name: "sally",
        array: false,
        default: 3,
        key: "sally",
        langName: "sally",
        aliases: ["sal cute"],
        type: "number"
    },
    "friends": {
        name: "friends",
        array: true,
        default: [],
        key: "friends",
        langName: "friends",
        type: "user"
    }
};
const config = (data: Partial<devConfig>): devConfig => {
    const out: Partial<devConfig> = {};
    out.friends = data.friends ?? [];
    out.sally = data.sally ?? 3;
    return out as devConfig;
};
export default class Dev extends Module<devConfig> {
    constructor(Hyperion: hyperion){
        const configKeys = new Map<string, configKey>(Object.entries(keys));

        super({
            name: "dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            hasCommands: true,
            config,
            subscribedEvents: ["guildCreate", "guildDelete"],
            save: (data: Partial<devConfig>): devConfig => {
                const template = config({});
                for(const key of Object.keys(data) as Array<keyof devConfig>){
                    if(data[key] === template[key]){
                        delete data[key];
                    }
                }
                return data as devConfig;
            },
            configKeys,
            private: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    async guildCreate(...args: [Guild]): Promise<void> {
        const guild = args[0];
        const exists = await this.Hyperion.manager.guild(guild.id).exists();
        if(!exists){
            this.Hyperion.manager.guild(guild.id).create();
        }else{
            this.Hyperion.manager.guild(guild.id).update({deleted: false});
        }
        this.Hyperion.client.editStatus(undefined, {name: `%help | ${this.Hyperion.client.guilds.size} servers`, type: 0});
        this.Hyperion.client.executeWebhook("707305665500151818", "v7riuTIwaFjVy88iC9LsFyj8vjvbv5CV2mdXQPpL_gZwJ8Fn140VMO2nYChMA11Y-Jiq", {
            embeds: [
                {
                    color: this.Hyperion.colors.default,
                    timestamp: new Date,
                    title: `Joined ${guild.name} - ${this.Hyperion.client.guilds.size} Guilds`,
                    description: `ID: ${guild.id}\nSize: ${guild.memberCount}\nShard: ${guild.shard.id}`
                }
            ]
        });
    }

    async guildDelete(...args: [Guild]): Promise<void> {
        const guild = args[0];
        this.Hyperion.manager.guild(guild.id).update({deleted: true, deletedAt: Date.now()});
        this.Hyperion.client.executeWebhook("707305665500151818", "v7riuTIwaFjVy88iC9LsFyj8vjvbv5CV2mdXQPpL_gZwJ8Fn140VMO2nYChMA11Y-Jiq", {
            embeds: [
                {
                    color: this.Hyperion.colors.default,
                    timestamp: new Date,
                    title: `Left ${guild.name} - ${this.Hyperion.client.guilds.size} Guilds`,
                    description: `ID: ${guild.id}\nSize: ${guild.memberCount}\nShard: ${guild.shard.id}`
                }
            ]
        });
    }
}