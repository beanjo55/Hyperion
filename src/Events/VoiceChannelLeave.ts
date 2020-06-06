/* eslint-disable @typescript-eslint/no-unused-vars */

import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelLeaveHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelLeave";
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handle(this: IHyperion, member: Member, oldChannel: VoiceChannel): Promise<void>{

    }
}
export default new VoiceChannelLeaveHandler;