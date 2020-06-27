/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion, EmbedResponse, CommandResponse} from "../../../types";
import {default as embedModule, CustomEmbed} from "../Embeds";
import { Embed } from "eris";

class Embeds extends Command{
    constructor(){
        super({
            name: "embed",
            module: "embeds",
            userperms: ["manager"],
            aliases: ["embeds"],
            helpDetail: "Create, manage, and post fully custom embeds.",
            helpUsage: "[See the command usage on the docs](https://docs.beanjo55.dev)",
            noExample: true,
            hasSub: true,
            noSubList: true
        });
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): CommandResponse{
        const names = await ctx.module.getEmbedNames(ctx.guild.id);
        const limit = await ctx.module.getGuildLimit(ctx.guild.id);
        if(names.length === 0){
            const data: EmbedResponse = {
                embed: {
                    title: "Server Embeds",
                    color: Hyperion.defaultColor,
                    description: "This server has no embeds",
                    timestamp: new Date,
                    footer: {text: `You can create up to ${limit} embeds on this server`}
                }
            };
            return data;
        }
        const data: EmbedResponse = {
            embed: {
                title: "Server Embeds",
                color: Hyperion.defaultColor,
                description: names.join("\n"),
                timestamp: new Date,
                footer: {text: `You can create up to ${limit} embeds on this server`}
            }
        };
        return data;
    }
}

class ListEmbeds extends Embeds{
    constructor(){
        super();
        this.name = "list";
        this.id = this.name;
        this.aliases = [];
    }
}

class CreateEmbed extends Embeds{
    constructor(){
        super();
        this.name = "create";
        this.id = this.name;
        this.aliases = ["new", "add"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please give a name for the new embed.";}
        try{
            await ctx.module.addNewEmbed(ctx.guild.id, ctx.args[1]);
            return "Successfully created embed!";
        }catch(err){
            return err.message;
        }
    }
}

class DeleteEmbed extends Embeds{
    constructor(){
        super();
        this.name = "delete";
        this.id = this.name;
        this.aliases = ["del", "delete"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please give the name of the embed to delete.";}
        try{
            const embeds = await ctx.module.getGuildEmbedMap(ctx.guild.id);
            embeds.delete(ctx.args[1]);
            await ctx.module.saveGuildEmbeds(ctx.guild.id, embeds);
            return "Successfully deleted embed!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedColor extends Embeds{
    constructor(){
        super();
        this.name = "color";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a color.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        let color = 0;
        if(ctx.args[2].startsWith("#")){
            color = color = parseInt(ctx.args[2].slice(1), 16);
            if(isNaN(color)){color = 0;}
        }
        if(color === 0 && ctx.args[2].startsWith("0x")){
            color = parseInt(ctx.args[2].slice(2), 16);
            if(isNaN(color)){color = 0;}
        }
        if(color === 0){
            color = parseInt(ctx.args[2], 16);
        }
        if(isNaN(color)){return "I didnt understand that color format.";}
        embed.embed.color = color;
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class PostEmbed extends Embeds{
    constructor(){
        super();
        this.name = "post";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed.";}
        if(!ctx.args[2]){return "Please specify a channel to post in.";}
        let embed: Partial<Embed> | undefined;
        try{
            embed = await ctx.module.requestEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[2]);
        if(!channel){return "Im not sure what channel that is.";}
        try{
            await channel.createMessage({embed: embed});
            return "Success!";
        }catch(err){
            if(err.message.includes("Discord")){return "Something went wrong.";}
            return err.message;
        }
    }
}

const subarr = [
    ListEmbeds,
    CreateEmbed,
    DeleteEmbed,
    EmbedColor,
    PostEmbed
];
export default Embeds;
export {subarr as subcmd};