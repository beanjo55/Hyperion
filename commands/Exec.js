const { inspect } = require('util');
const { command } = require('../command.js');
const { exec } = require('child_process');
const config = require("../config.json");

function _getMaxDepth(toInspect, toEval) {
    let maxDepth = 10;
    for (let i = 0; i < 10; i++) {
        if (inspect(toInspect, { depth: i }).length > (1980 - toEval.length)) {
            maxDepth = i - 1;
            return ;
        }
    }
    return maxDepth;
}




class Exec extends command{
    constructor(){
        super();
        this.name = "exec";
        this.aliases = ["ex", "execute"];
        this.alwaysEnabled = true;
        this.requiredUsers = ["253233185800847361"];
        this.id = this.name;
        this.commandType = "developer";
    }
    async execute (msg, args) {
        if(msg.author.id !== config.owner){
            return;
        }
    
    
        exec(args.join(' '), (error, stdout) => {
            const outputType = error || stdout;
            let output = outputType;
            if (typeof outputType === 'object') {
                output = inspect(outputType, {
                    depth: _getMaxDepth(outputType, args.join(' '))
                });
            }
            output = (output.length > 1980 ? output.substr(0, 1977) + '...' : output);
            return msg.channel.createMessage('```' + output + '```');
        
            
        });


    }




}
exports.cmd = Exec;