/* eslint-disable @typescript-eslint/no-unused-vars */
import {HyperionInterface} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelSwitchHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelSwitch";
    }
    async handle(this: HyperionInterface, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel): Promise<void>{

    }
}
exports.event = new VoiceChannelSwitchHandler;