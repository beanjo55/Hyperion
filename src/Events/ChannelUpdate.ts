/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {GuildChannel} from "eris";
const eventName = "channelUpdate";
import {inspect} from "util";
class ChannelUpdateHandler{
    name: string;
    constructor(){
        this.name = "channelUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, channel: GuildChannel, oldChannel: any): Promise<void>{
        if(!channel.guild){return;}
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.channelUpdate(this, channel.guild, channel, oldChannel);
        });
    }
}
export default new ChannelUpdateHandler;