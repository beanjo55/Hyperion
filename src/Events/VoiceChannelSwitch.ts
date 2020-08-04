/* eslint-disable @typescript-eslint/no-unused-vars */
import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
const eventName = "voiceChannelSwitch";
class VoiceChannelSwitchHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelSwitch";
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handle(this: IHyperion, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.voiceChannelSwitch(this, member, newChannel, oldChannel);
        });
    }
}
export default new VoiceChannelSwitchHandler;