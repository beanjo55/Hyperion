import hyperion from "../main";

export default class Utils {
    Hyperion: hyperion;
    constructor(Hyperion: hyperion) {
        this.Hyperion = Hyperion;
    }

    input2Boolean(input: string): boolean | undefined {
        if(!input){return;}
        input = input.trim().toLowerCase();
        if(input === "yes" || input === "true"){return true;}
        if(input === "no" || input === "false"){return true;}
    }
}