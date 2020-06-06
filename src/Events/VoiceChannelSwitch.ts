/* eslint-disable @typescript-eslint/no-unused-vars */
import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelSwitchHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelSwitch";
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handle(this: IHyperion, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel): Promise<void>{

    }
}
export default new VoiceChannelSwitchHandler;