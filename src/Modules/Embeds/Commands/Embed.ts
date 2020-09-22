/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion, EmbedResponse, CommandResponse, Field} from "../../../types";
import {default as embedModule, CustomEmbed} from "../Embeds";
import { Embed, EmbedField } from "eris";

class Embeds extends Command{
    constructor(){
        super({
            name: "embed",
            module: "embeds",
            userperms: ["manager"],
            aliases: ["embeds"],
            helpDetail: "Create, manage, and post fully custom embeds.",
            helpUsage: "[See the command usage on the docs](https://docs.hyperionbot.xyz/embeds/embedsmain)",
            noExample: true,
            hasSub: true,
            noSubList: true,
            listUnder: "manager"
        });
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): CommandResponse{
        const names = await ctx.module.getEmbedNames(ctx.guild.id);
        const limit = await ctx.module.getGuildLimit(ctx.guild.id);
        if(names.length === 0){
            const data: EmbedResponse = {
                embed: {
                    title: "Server Embeds",
                    color: Hyperion.colors.default,
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
                color: Hyperion.colors.default,
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
        if(!isNaN(Number(ctx.args[2]))){
            color = Number(ctx.args[2]);
        }
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
        this.aliases = ["send"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed.";}
        let embed: Partial<Embed> | undefined;
        try{
            embed = await ctx.module.requestEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        const channel = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[2] ?? ctx.channel.id);
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

class EmbedDescription extends Embeds{
    constructor(){
        super();
        this.name = "description";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a description.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.description = undefined;
        }else{
            embed.embed.description = ctx.args.slice(2).join(" ");
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.description === undefined){return "Removed description.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedTitle extends Embeds{
    constructor(){
        super();
        this.name = "title";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a title.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.title = undefined;
        }else{
            embed.embed.title = ctx.args.slice(2).join(" ");
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.title === undefined){return "Removed title.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedTimestamp extends Embeds{
    constructor(){
        super();
        this.name = "timestamp";
        this.id = this.name;
        this.aliases = ["time", "date"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a time or yes/no.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        const bol = Hyperion.utils.input2boolean(ctx.args[2]);
        if(bol !== undefined){
            embed.timestamp = bol;
        }else{
            const num = Number(ctx.args[2]);
            if(isNaN(num)){return "Invalid timestamp provided.";}
            embed.timestamp = num;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.timestamp === false){return "Removed timestamp.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}



class EmbedImage extends Embeds{
    constructor(){
        super();
        this.name = "image";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify an image.";}
        const imageRX = new RegExp(/https?:\/\/.+\.(png|gif|jpg)$/);
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.image = undefined;
        }else{
            const result = imageRX.exec(ctx.args[2]);
            if(!result){return "Invalid image supplied.";}
            embed.embed.image = {url: ctx.args[2]};
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.image === undefined){return "Removed image.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedThumbnail extends Embeds{
    constructor(){
        super();
        this.name = "thumbnail";
        this.id = this.name;
        this.aliases = ["thumb"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a thumbnail image.";}
        const imageRX = new RegExp(/https?:\/\/.+\.(png|gif|jpg)$/);
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.thumbnail = undefined;
        }else{
            const result = imageRX.exec(ctx.args[2]);
            if(!result){return "Invalid image supplied.";}
            embed.embed.thumbnail = {url: ctx.args[2]};
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.thumbnail === undefined){return "Removed image.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedFooterText extends Embeds{
    constructor(){
        super();
        this.name = "footertext";
        this.id = this.name;
        this.aliases = ["ft"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify text for the footer.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.footer = undefined;
        }else{
            embed.embed.footer = {text: ctx.args.slice(2).join(" ")};
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.footer === undefined){return "Removed footer.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedFooterIcon extends Embeds{
    constructor(){
        super();
        this.name = "footericon";
        this.id = this.name;
        this.aliases = ["fi"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify an icon for the footer.";}
        const imageRX = new RegExp(/https?:\/\/.+\.(png|gif|jpg)$/);
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.footer!.icon_url = undefined;
        }else{
            if(!embed.embed.footer!.text){return "Footers will not work without text, set one first!";}
            embed.embed.footer!.icon_url = ctx.args[2];
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.footer!.icon_url === undefined){return "Removed footer icon.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedAuthorText extends Embeds{
    constructor(){
        super();
        this.name = "authorname";
        this.id = this.name;
        this.aliases = ["at", "an", "authortext"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a name for the author.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.author = undefined;
        }else{
            embed.embed.author = {name: ctx.args.slice(2).join(" ")};
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.author === undefined){return "Removed author.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedAuthorIcon extends Embeds{
    constructor(){
        super();
        this.name = "authoricon";
        this.id = this.name;
        this.aliases = ["ai"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify an icon for the author.";}
        const imageRX = new RegExp(/https?:\/\/.+\.(png|gif|jpg)$/);
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.author!.icon_url = undefined;
        }else{
            if(!embed.embed.author!.name){return "Author will not work without text, set one first!";}
            embed.embed.author!.icon_url = ctx.args[2];
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.author!.icon_url === undefined){return "Removed author icon.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedAuthorURL extends Embeds{
    constructor(){
        super();
        this.name = "authorurl";
        this.id = this.name;
        this.aliases = ["aurl"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify an url for the author.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(ctx.args[2].toLowerCase() === "remove"){
            embed.embed.author!.url = undefined;
        }else{
            if(!embed.embed.author!.name){return "Author will not work without text, set one first!";}
            embed.embed.author!.url = ctx.args[2];
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            if(embed.embed.author!.url === undefined){return "Removed author url.";}
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedAddField extends Embeds{
    constructor(){
        super();
        this.name = "addfield";
        this.id = this.name;
        this.aliases = ["af", "createfield", "newfield"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a description.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(embed.embed.fields === undefined || embed.embed.fields === null){embed.embed.fields = [];}
        const split = ctx.args.slice(2).join(" ").split(" ; ");
        if(split.length < 2 || split.length > 3){return "Invalid number of options provided.";}
        split.forEach((val, ind) => {
            split[ind] = val.trim();
        });
        if(split.length === 2){
            embed.embed.fields.push({name: split[0], value: split[1]});
        }else{
            const bol = Hyperion.utils.input2boolean(split[2]);
            if(bol === undefined){return "Invalid inline option provided, try yes or no.";}
            embed.embed.fields.push({name: split[0], value: split[1], inline: bol});
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            return "Success!";
        }catch(err){
            return err.message;
        }
    }
}

class EmbedRemoveField extends Embeds{
    constructor(){
        super();
        this.name = "removefield";
        this.id = this.name;
        this.aliases = ["rf", "df", "delfield", "deletefield"];
    }

    async execute(ctx: ICommandContext<embedModule>, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please specify an embed to edit.";}
        if(!ctx.args[2]){return "Please specify a field to remove.";}
        let embed: CustomEmbed | undefined;
        try{
            embed = await ctx.module.getEmbed(ctx.guild.id, ctx.args[1]);
        }catch(err){
            return err.message;
        }
        if(!embed){return "This shouldnt be possible, no error but no embed";}
        if(embed.embed.fields === undefined || embed.embed.fields.length === 0){return "There are no fields to remove.";}
        let toDel: null | EmbedField = null;
        for(const field of embed.embed.fields) {
            if(ctx.args.slice(2).join(" ") === field.name){toDel = field; break;}
        }
        if(toDel === null){return "I couldnt find a field by that name in this embed.";}
        if(embed.embed.fields.length === 1){
            embed.embed.fields = undefined;
        }else{
            const newArr: Array<EmbedField> = [];
            for(const field of embed.embed.fields){
                if(field !== toDel){newArr.push(field);}
            }
            embed.embed.fields = newArr;
        }
        try{
            await ctx.module.updateEmbed(ctx.guild.id, ctx.args[1], embed);
            return `Removed field \`${ctx.args.slice(2).join(" ")}\`.`;
        }catch(err){
            return err.message;
        }
    }
}


const subarr = [
    ListEmbeds,
    CreateEmbed,
    DeleteEmbed,
    EmbedColor,
    PostEmbed,
    EmbedDescription,
    EmbedTitle,
    EmbedTimestamp,
    EmbedImage,
    EmbedThumbnail,
    EmbedFooterText,
    EmbedFooterIcon,
    EmbedAuthorText,
    EmbedAuthorIcon,
    EmbedAuthorURL,
    EmbedAddField,
    EmbedRemoveField
];
export default Embeds;
export {subarr as subcmd};