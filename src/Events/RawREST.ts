import {inspect} from "util";
import {IHyperion} from "../types";
class RawRESTHandler{
    name: string;
    constructor(){
        this.name = "rawREST";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, packet: any): Promise<void>{
        if(this.logLevel < 5){return;}
        console.log(inspect(packet, {depth: 0}));
    }
}
export default new RawRESTHandler;