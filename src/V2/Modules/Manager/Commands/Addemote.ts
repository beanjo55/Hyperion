import {Command} from "../../../Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import {default as fetch} from "node-fetch";

class AddEmote extends Command{
    constructor(){
        super({
            name: "addemote",
            module: "manager",
            userperms: ["manager"],
            aliases: ["addemoji", "steal", "acquire", "copyrightinfringe", "yoink"],
            cooldownTime: 10000,
            botperms: ["manageEmojis"],

            helpDetail: "Adds an emote to the server from a link.",
            helpUsage: "{prefix}addemote [name] [Link]",
            helpUsageExample: "{prefix}addemote Sally https://cdn.discordapp.com/emojis/664222020581720065.png?v=1"
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Please specify an emote name and link.";}
        if(!ctx.args[1]){return "Please specify a link.";}
        const img = await this.resolveImage(ctx.args[1]);
        if(!img){return "Invalid link provided.";}
        try{
            await ctx.guild.createEmoji({name: ctx.args[0], image: img});
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to add emote to ${ctx.guild.id}, error: ${err.message}`, "Add Emote");
            return "Something went wrong.";
        }
        return "Successfully added emote!";

    }

    async resolveImage(image: string): Promise<string | null | undefined> {
        if (!image){return;}
        const file = await this.resolveFileAsBuffer(image);
        if(!file){return;}
        return this.resolveBase64(file);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolveBase64(data: any): string{
        if (Buffer.isBuffer(data)) return `data:image/png;base64,${data.toString("base64")}`;
        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async resolveFileAsBuffer(resource: any): Promise<Buffer | undefined> {
        const file = await this.resolveFile(resource);
        if(!file){return;}
        if (Buffer.isBuffer(file)) return file;
    
        const buffers = [];
        for await (const data of file) buffers.push(data);
        return Buffer.concat((buffers as Uint8Array[]));
    }

    async resolveFile(resource: string): Promise<NodeJS.ReadableStream | undefined> {
        if (/^https?:\/\//.test(resource)) {
            const res = await fetch(resource);
            return res.body;
        }else{
            return;
        }
    }

    convertToBuffer(ab: ArrayBuffer): Buffer {
        if (typeof ab === "string") ab = this.str2ab(ab);
        return Buffer.from(ab);
    }
    
    str2ab(str: string): ArrayBuffer {
        const buffer = new ArrayBuffer(str.length * 2);
        const view = new Uint16Array(buffer);
        for (let i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
        return buffer;
    }
}
export default AddEmote;