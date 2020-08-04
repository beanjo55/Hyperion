import {HypescriptContext} from "./Types";

export class BaseVariable{
    name: string;
    pattern: RegExp;
    constructor(data: BaseVariable){
        this.name = data.name;
        this.pattern = data.pattern;
        this.formatter = data.formatter;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formatter(ctx: HypescriptContext): Promise<string> | string{
        throw new Error("Unimplemented Formatter");
    }
}

