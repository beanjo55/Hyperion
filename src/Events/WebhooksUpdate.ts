/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {IHyperion} from "../types";
class WebhooksUpdateHandler{
    name: string;
    constructor(){
        this.name = "webhooksUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, data: any, channelID: string, guildID: string): Promise<void>{

    }
}
export default new WebhooksUpdateHandler;