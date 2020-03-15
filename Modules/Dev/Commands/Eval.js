const command = require('../../../Core/Structures/Command.js').struct;
const { inspect } = require('util');



class Eval extends command{
    constructor(){
        super();
        this.name = "eval";
        this.id = this.name;
        this.module = "dev";
        this.aliases = ["e", "evaluate"];

        this.internal = true;
        this.alwaysEnabled = true;

        this.dev = true;

        this.hasSub = true;
        this.subcommandslist = [AsyncEval]

        this.helpDetail = "Evaluates JavaScript code";
        this.helpSubcommands = "{prefix}eval async - Evaluates JavaScript code in an async context";
        this.helpUsage = "{prefix}eval code\n{prefix}eval async code";
        this.helpUsageExample = "{prefix}eval 1 + 1\n{prefix}eval async return 1 + 1";

    }
    async execute(ctx){
        //console.log(ctx.args)
        const code = ctx.args.join(" ");
       
        try{
            let evaled = await eval(code);
            if(typeof evaled !== "string"){
                evaled = inspect(evaled, {depth: 0});
            }
            return {status: {code: 0}, payload: await this.evalresult(ctx, evaled)};
        }catch(err){
            return {status: {code: 0}, payload: await this.evalerror(ctx, err)};
        }
    }

    async clean(text, ctx){
        const rx = new RegExp(ctx.Hyperion.token, "gim");
        if (typeof(text) === "string"){
            text = text.replace(rx, "Fuck You");
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        }else{
            return text;
        }
    }

    async evalresult(ctx, result){
        const output = await this.clean(result, ctx);
        if(output.length > 1990){
            return "The output was too long, it was sent to the console log";
        }
        const data ={
            embed: {
                author: { name: 'Eval Results', icon_url: ctx.user.avatarURL },
                description: "```js\n" + output + "```",
                color: ctx.Hyperion.defaultColor,
                timestamp: new Date()
            }
        };
        return data;
    }

    async evalerror(ctx, result){
        return "`ERROR`\n```x1\n" + await this.clean(result, ctx) + "```";
    }

}

class AsyncEval extends Eval{
    constructor(){
        super();
        this.name = "async";
        this.id = this.name;
        this.ailiases = ["a"];
    }

    async execute(ctx){
        const code = "async function run(ctx){" + ctx.args.slice(1).join(" ") + "}; run(ctx)";
        try{
            let evaled = await eval(code);
            if(typeof evaled !== "string"){
                evaled = inspect(evaled, {depth: 0});
            }
            return {status: {code: 0}, payload: await this.evalresult(ctx, evaled)};
        }catch(err){
            return {status: {code: 0}, payload: await this.evalerror(ctx, err)};
        }

    }
}
exports.cmd = Eval;