/* eslint-disable @typescript-eslint/no-unused-vars */
import {IHyperion} from "../types";
import {Message} from "eris";
class MessageReactionRemoveAllHandler{
    name: string;
    constructor(){
        this.name = "messageReactionRemoveAll";
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handle(this: IHyperion, msg: Message): Promise<void>{

    }
}
export default new MessageReactionRemoveAllHandler;