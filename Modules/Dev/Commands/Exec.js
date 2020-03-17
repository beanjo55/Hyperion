const command = require('../../../Core/Structures/Command.js').struct;
const { exec } = require('child_process');
const { inspect } = require('util');

class Exec extends command{
    constructor(){
        super();
        this.name = "exec";
        this.id = this.name;
        this.module = "dev";
        this.aliases = ["ex", "execute"];

        this.internal = true;
        this.alwaysEnabled = true;
        this.dev = true;
        this.selfResponse = true;
        
        this.helpDetail = "Executes a system command on the host system";
        this.helpUsage = "{prefix}execute systemcommand";
        this.helpUsageExample = "{prefix}execute git pull";
    }

    async execute(ctx){
        
        try{
            exec(ctx.args.join(" "), (error, stdout) => {
                const outputType = error || stdout;
                let output = outputType;
                if (typeof outputType === 'object') {
                    output = inspect(outputType, {
                        depth: this._getMaxDepth(outputType, ctx.args.join(' '))
                    });
                }
                output = (output.length > 1980 ? output.substr(0, 1977) + '...' : output);
                output = "```" + output + "```";
                
                ctx.channel.createMessage(output);
            })
            
        }catch(err){
            return {status: {code: 2, error: err}, payload: "Something went wrong"};
        }
        
    }

    _getMaxDepth(toInspect, toEval) {
        let maxDepth = 10;
        for (let i = 0; i < 10; i++) {
            if (inspect(toInspect, { depth: i }).length > (1980 - toEval.length)) {
                maxDepth = i - 1;
                return ;
            }
        }
        return maxDepth;
    }
}
exports.cmd = Exec;