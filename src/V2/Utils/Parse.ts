

export function multiArg(input: Array<string>, options: Array<string>): undefined | {match: string; offset: number} {
    const matches: Array<string> = [];
    for(const option of options){
        if(option.toLowerCase().startsWith(input[0].toLowerCase())){matches.push(option);}
    }
    if(matches.length === 0){return;}
    for(const match of matches){
        if(match.toLowerCase() === input[0].toLowerCase()){return {match: match, offset: 0};}
        let out: {match: string; offset: number} | undefined = undefined;
        input.forEach((value: string, index: number) => {
            if(index !== 0){
                if(match.toLowerCase().endsWith(value.toLowerCase())){
                    if(match.toLowerCase() === input.slice(0, index+1).join("").toLowerCase()){
                        out = {match: match, offset: index};
                    }
                }
            }
        });
        if(out !== undefined){return out;}
    }
    return undefined;
}