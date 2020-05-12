/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import {HyperionInterface} from "../types";
import {Member, VoiceChannel} from "eris";
class VoiceChannelLeaveHandler{
    name: string;
    constructor(){
        this.name = "voiceChannelLeave";
    }
    async handle(this: HyperionInterface, member: Member, oldChannel: VoiceChannel): Promise<void>{

    }
}
exports.event = new VoiceChannelLeaveHandler;