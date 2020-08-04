/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {GuildChannel} from "eris";
const eventName = "channelCreate";
class ChannelCreateHandler{
    name: string;
    constructor(){
        this.name = "channelCreate";
    }
    async handle(this: IHyperion, channel: GuildChannel): Promise<void>{
        if(!channel.guild){return;}
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.channelCreate(this, channel.guild, channel);
        });
    }
}
export default new ChannelCreateHandler;