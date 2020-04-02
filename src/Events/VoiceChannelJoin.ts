import {HyperionInterface} from "../types";
import {Member, VoiceChannel} from 'eris';
class VoiceChannelJoinHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelJoin";
    }
    async handle(this: HyperionInterface, member: Member, newChannel: VoiceChannel){

    }
}
exports.event = new VoiceChannelJoinHandler;