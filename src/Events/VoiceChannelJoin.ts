/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
const eventName= "voiceChannelJoin";
class VoiceChannelJoinHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelJoin";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(this: IHyperion, member: Member, newChannel: VoiceChannel): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.voiceChannelJoin(this, member, newChannel);
        });
    }
}
export default new VoiceChannelJoinHandler;