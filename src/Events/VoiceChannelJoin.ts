/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelJoinHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelJoin";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(this: IHyperion, member: Member, newChannel: VoiceChannel): Promise<void>{

    }
}
export default new VoiceChannelJoinHandler;