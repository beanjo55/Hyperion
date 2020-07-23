/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {GuildChannel} from "eris";
class ChannelUpdateHandler{
    name: string;
    constructor(){
        this.name = "channelUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, channel: GuildChannel, oldChannel: any): Promise<void>{

    }
}
export default new ChannelUpdateHandler;