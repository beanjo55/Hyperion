import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {ICommandContext, IHyperion, EmbedResponse} from "../../../types";
// eslint-disable-next-line no-unused-vars
import {Member, Role, Collection, Embed} from "eris";


class Whois extends Command{
    constructor(){
        super({
            name: "whois",
            module: "info",
            aliases: ["w"],

            helpDetail: "Shows information about a user.",
            helpUsage: "{prefix}whois\n{prefix}whois @user",
            helpUsageExample: "{prefix}whois @bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        let target: Member | undefined;
        if(ctx.args[0]){
            target = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        }else{
            target = ctx.member;
        }

        if(!target){return "That user was not found!";}
        
        const roleList: Array<string> = [];
        let color = Hyperion.defaultColor;
        if(target.roles){
            const roleObj = Hyperion.utils.sortRoles(target.roles, ctx.guild.roles);
            const temp = new Collection(Role);
            roleObj.forEach((r: Role) => {temp.add(r);});
            const tColor = Hyperion.utils.getColor(temp, ctx.guild.roles);
            if(tColor !== 0){ color = tColor;}
            roleObj.forEach((r: Role) => {
                roleList.push(r.mention);
            });
        }else{
            roleList.push("None");
        }
        if(!color){color = Hyperion.defaultColor;}
        if(color === 0){color = Hyperion.defaultColor;}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let joinPos = (ctx.guild.members.filter((m: Member) => !m.bot).sort((a: Member, b: Member) => a.joinedAt - b.joinedAt).map((m: Member) => m.id).indexOf(target.id) + 1).toString();

        if(joinPos === undefined){joinPos = "N/A";}
        let rep = await Hyperion.managers.user.getRep(target.id);
        let given = await Hyperion.managers.user.getGivenRep(target.id);
        let money = await Hyperion.managers.user.getMoney(target.id);

        if(rep === undefined){rep = 0;}
        if(given === undefined){given = 0;}
        if(money === undefined){money = 0;}
        const data: EmbedResponse = {
            embed: {
                thumbnail: {url: target.avatarURL},
                description: "",
                author: {
                    name: `${target.username}#${target.discriminator}`,
                    icon_url: target.avatarURL
                },
                footer: {
                    text: `User ID: ${target.id}`
                },
                color: color,
                timestamp: new Date(),
                fields: [
                    {
                        name: "Registered On",
                        value: new Date(target.createdAt).toDateString(),
                        inline: true
                    },
                    {
                        name: "Joined On",
                        value: new Date(target.joinedAt).toDateString(),
                        inline: true
                    },
                    {
                        name: Hyperion.fetch ? "Join Position" : "\u200b",
                        value: Hyperion.fetch ? joinPos : "\u200b",
                        inline: true
                    },
                    {
                        name: "Rep Recieved",
                        value: rep.toString(),
                        inline: true
                    },
                    {
                        name: "Rep Given",
                        value: given.toString(),
                        inline: true
                    },
                    {
                        name: "Money",
                        value: `$${money}`,
                        inline: true
                    }
                ]
            }
        };

        if(target.nick){
            data.embed.description = `${target.username}#${target.discriminator} **${target.nick}**\n${target.mention}`;
        }else{
            data.embed.description = `${target.username}#${target.discriminator}\n${target.mention}`;
        }

        let bio = await Hyperion.managers.user.getBio(target.id);
        if(bio && bio !== ""){
            if(bio.length > 1024){
                bio = bio.substring(0, 1020) + "...";
            }
            data.embed.fields!.push({
                name: "Bio",
                value: bio
            });
        }

        const roleString = roleList.join(" ");
        if(roleString.length > 0){
            data.embed.fields!.push({
                name: "Roles",
                value: roleString
            });
        }
        
        
        const acks = await Hyperion.managers.user.getAcks(target.id);
        const ack: Array<string> = [];
        if(acks.owner){ack.push("Bot Owner");}
        if(acks.developer){ack.push("Bot Developer");}
        if(acks.admin){ack.push("Hyperion Board Member");}
        if(acks.support){ack.push("Support Team");}
        if(acks.staff){ack.push("Community Staff");}
        if(acks.friend){ack.push("Project Friend");}
        if(acks.contrib){ack.push("Project Contributor");}
        if(acks.custom){ack.push(acks.custom);}
        if(target.id === ctx.guild.ownerID){
            ack.push("Server Owner");
        }else{
            if(target.permission.has("administrator")){
                ack.push("Server Administrator");
            }else{
                if(target.permission.has("manageGuild")){
                    ack.push("Server Manager");
                }else{
                    const mods = await Hyperion.managers.guild.getMods(ctx.guild.id);
                    for(let i = 0; i < mods.length; i++){
                        if(target.roles.includes(mods[i])){
                            ack.push("Server Moderator");
                            break;
                        }
                    }
                }
            }
        }
        if(ack.length > 0){
            data.embed.fields!.push({name: "Acknowledgements", value: ack.join(", ")});
        }
        return data;
    }
}
export default Whois;