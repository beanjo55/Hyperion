/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildDelete";
    }
    async handle(this: HyperionInterface, guild: Guild){
        this.client.executeWebhook("707305665500151818", "v7riuTIwaFjVy88iC9LsFyj8vjvbv5CV2mdXQPpL_gZwJ8Fn140VMO2nYChMA11Y-Jiq", {
            embeds: [
                {
                    color: this.defaultColor,
                    timestamp: new Date,
                    title: `Left ${guild.name} - ${this.client.guilds.size} Guilds`,
                    description: `ID: ${guild.id}\nSize: ${guild.memberCount}\nShard: ${guild.shard.id}`
                }
            ]
        });
    }
}
exports.event = new GuildDeleteHandler;