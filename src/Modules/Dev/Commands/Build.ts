import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";
const { exec } = require("child_process");


class Build extends Command{
    constructor(){
        super({
            name: "build",
            module: "dev",
            internal: true,
            dev: true,
            selfResponse: true,
            helpDetail: "Fetches a new built version from the CI",
            helpUsage: "{prefix}build\n{prefix}build [build number]",
            helpUsageExample: "{prefix}build\n{prefix}build 8"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        let buildNum: string = "latest";
        if(ctx.args[0] && !isNaN(Number(ctx.args[0]))){buildNum = ctx.args[0];}
        const dir: string = `${__dirname}../../../../../`;
        const commandString: string = "cd " + dir
        + " | curl https://circleci.com/api/v1.1/project/github/beanjo55/Hyperion/" + buildNum + "/artifacts?circle-token=" + Hyperion.circleCIToken
        + " | grep -o 'https://[^\"]*'"
        + " | sed -e \"s/$/?circle-token=" + Hyperion.circleCIToken + "\""
        + " | wget -v -i -";
        let message: string = "";
        if(buildNum === "latest"){
            message = "Downloading latest build from CircleCI";
        }else{
            message = `Downloading build ${buildNum} from CircleCI`;
        }
        let post = await ctx.channel.createMessage(message);
        try{
            // eslint-disable-next-line no-unused-vars
            exec(commandString, (error: any, stdout: any) =>{
                if(error){return post.edit("Something went wrong");}
                return post.edit(`Sucessfully downloaded and extarcted build ${buildNum}!`);
            });
        }catch(err){
            post.edit("Something went wrong");
        }
    }
}
export default Build;