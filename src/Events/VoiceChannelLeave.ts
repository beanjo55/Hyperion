import {HyperionInterface} from "../types";
import {Member, VoiceChannel} from 'eris';
class VoiceChannelLeaveHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelLeave";
    }
    async handle(this: HyperionInterface, member: Member, oldChannel: VoiceChannel){

    }
}
exports.event = new VoiceChannelLeaveHandler;