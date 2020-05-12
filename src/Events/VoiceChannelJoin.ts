/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelJoinHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelJoin";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(this: HyperionInterface, member: Member, newChannel: VoiceChannel): Promise<void>{

    }
}
exports.event = new VoiceChannelJoinHandler;