/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildCreateHandler{
    name: string;
    constructor(){
        this.name = "guildCreate";
    }
    async handle(this: HyperionInterface, guild: Guild){
        if(!await this.managers.guild.exists(guild.id)){
            this.managers.guild.createConfig(guild.id);
        }
        this.client.editStatus(undefined, {name: `%help | ${this.client.guilds.size} servers`, type: 0});
        this.client.executeWebhook("707305665500151818", "v7riuTIwaFjVy88iC9LsFyj8vjvbv5CV2mdXQPpL_gZwJ8Fn140VMO2nYChMA11Y-Jiq", {
            embeds: [
                {
                    color: this.defaultColor,
                    timestamp: new Date,
                    title: `Joined ${guild.name} - ${this.client.guilds.size} Guilds`,
                    description: `ID: ${guild.id}\nSize: ${guild.memberCount}\nShard: ${guild.shard.id}`
                }
            ]
        });
    }
}
exports.event = new GuildCreateHandler;

// https://canary.discordapp.com/api/webhooks/707305665500151818/v7riuTIwaFjVy88iC9LsFyj8vjvbv5CV2mdXQPpL_gZwJ8Fn140VMO2nYChMA11Y-Jiq