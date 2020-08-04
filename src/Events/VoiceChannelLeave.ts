/* eslint-disable @typescript-eslint/no-unused-vars */

import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
const eventName = "voiceChannelLeave";
class VoiceChannelLeaveHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelLeave";
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handle(this: IHyperion, member: Member, oldChannel: VoiceChannel): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.voiceChannelLeave(this, member, oldChannel);
        });
    }
}
export default new VoiceChannelLeaveHandler;