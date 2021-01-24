import command from "../../../Structures/Command";
import hyperion, { CommandContext, CommandResponse } from "../../../main";
import { exec } from "child_process";

export default class Build extends command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "build",
            help: {detail: "test", usage: "test"},
            module: "dev",
            specialPerms: "dev",
            aliases: ["update"],
            hasSub: true
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        let buildNum = "latest";
        if(ctx.args[0] && !isNaN(Number(ctx.args[0]))){buildNum = ctx.args[0];}
        const dir = `${__dirname}../../../../`;
        const commandString: string = "cd " + dir
        + " | curl https://circleci.com/api/v1.1/project/github/beanjo55/Hyperion/" + buildNum + "/artifacts?circle-token=" + this.Hyperion.circleCIToken
        + " | grep -o 'https://[^\"]*'"
        + " | sed -e \"s/$/?circle-token=" + this.Hyperion.circleCIToken + "/\""
        + " | wget -q --output-document=./built.tar -i -";

        const stage2: string = "cd " + dir
        + " | mv build/ oldBuild/"
        + " | tar --overwrite -xf built.tar";
        //+ " | rm -rf built.tar"
        //+ " | rm -Rf oldBuild/";

        let message = "";
        if(buildNum === "latest"){
            message = "Downloading latest build from CircleCI";
        }else{
            message = `Downloading build ${buildNum} from CircleCI`;
        }
        const post = await ctx.channel.createMessage(message);
        try{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            exec(commandString, (error: any, stdout: any) =>{
                if(error){
                    console.log(error);
                    return post.edit("Download failed");
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exec(stage2, (error2: any, stdout2: any) => {
                    if(error2){
                        console.log(error2);
                        return post.edit("Extract failed");
                    }
                    if(buildNum === "latest"){return post.edit("Sucessfully downloaded and extracted latest build!");}
                    return post.edit(`Sucessfully downloaded and extracted build ${buildNum}!`);
                });
            });
        }catch(err){
            post.edit("Something went wrong");
        }
        return {success: true, literal: true, content: null};
    }
}