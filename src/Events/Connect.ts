import {IHyperion} from "../types";
class ConnectHandler{
    name: string;
    constructor(){
        this.name = "connect";
    }
    async handle(this: IHyperion, shardID: number): Promise<void>{
        this.logger.info("Hyperion", `Shard ${shardID} has connected`, "Sharding");
        /*
        const bot = this.build === "prod" ? "https://cdn.discordapp.com/avatars/633056645194317825/7e7504446308e98405fad424d3d80f19.png?size=2048" : "https://cdn.discordapp.com/avatars/651292572978905102/ea248cda445cbd787fafef085e1ae94c.png?size=4096";
        this.client.executeWebhook("702215838115037264", "bjstmytm7m5qh1jJt2y02ajScn1LXzyVhQi4YY2ilSJUFt7CsV-1C270-QwnScNar6Qk", {
            embeds: [
                {
                    title: `Shard ${shardID} connecting`,
                    timestamp: new Date,
                    color: this.colors.default,
                    footer: {text: this.build}
                }
            ],
            avatarURL: bot
        });*/
    }
}
export default new ConnectHandler;
