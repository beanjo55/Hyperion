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

export default class Dev extends Module<Record<string, never>> {
    guildJoinEvent: {[key: string]: 1} = {};
    guildLeaveEvent: {[key: string]: 1} = {};
    constructor(Hyperion: hyperion){
        //const configKeys = new Map<string, configKey>(Object.entries(keys));

        super({
            name: "dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            hasCommands: true,
            subscribedEvents: ["guildCreate", "guildDelete"],
            private: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    async guildCreate(...args: [Guild]): Promise<void> {
        const guild = args[0];
        if(this.guildJoinEvent[guild.id] !== 1){
            this.guildJoinEvent[guild.id] = 1;
            const clear = () => {
                delete this.guildJoinEvent[guild.id];
            };
            setTimeout(clear.bind(this), 1000);
            const exists = await this.Hyperion.manager.guild().get(guild.id);
            if(exists.deleted){
                this.Hyperion.manager.guild().update(guild.id, {deleted: false});
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
    }

    async guildDelete(...args: [Guild]): Promise<void> {
        const guild = args[0];
        if(this.guildLeaveEvent[guild.id] !== 1){
            this.guildLeaveEvent[guild.id] = 1;
            const clear = () => {
                delete this.guildLeaveEvent[guild.id];
            };
            setTimeout(clear.bind(this), 1000);
            this.Hyperion.manager.guild().update(guild.id, {deleted: true, deletedAt: Date.now()});
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
}