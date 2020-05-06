import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";
// eslint-disable-next-line no-unused-vars
import {Member, Role, Collection} from "eris";


class Whois extends Command{
    constructor(){
        super({
            name: "whois",
            module: "info",
            aliases: ["w"],

            helpDetail: "Shows information about a user",
            helpUsage: "{prefix}whois\n{prefix}whois @user",
            helpUsageExample: "{prefix}whois @bean"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        let target: Member | undefined;
        if(ctx.args[0]){
            target = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        }else{
            target = ctx.member;
        }

        if(!target){return "Who?";}
        
        let roleList: Array<String> = [];
        let color = Hyperion.defaultColor;
        if(target.roles){
            const roleObj = Hyperion.utils.sortRoles(target.roles, ctx.guild.roles);
            let temp = new Collection(Role);
            roleObj.forEach((r: Role) => {temp.add(r);});
            let tColor = Hyperion.utils.getColor(temp, ctx.guild.roles);
            if(tColor !== 0){ color = tColor;}
            roleObj.forEach((r: Role) => {
                roleList.push(r.mention);
            });
        }else{
            roleList.push("None");
        }
        if(!color){color = Hyperion.defaultColor;}
        if(color === 0){color = Hyperion.defaultColor;}

        let joinPos: any = ctx.guild.members.filter((m: Member) => !m.bot).sort((a: Member, b: Member) => a.joinedAt - b.joinedAt).map((m: Member) => m.id).indexOf(target.id) + 1;

        if(joinPos === undefined){joinPos = "N/A";}
        let rep = await Hyperion.managers.user.getRep(target.id);
        let given = await Hyperion.managers.user.getGivenRep(target.id);
        let money = await Hyperion.managers.user.getMoney(target.id);

        if(rep === undefined){rep = 0;}
        if(given === undefined){given = 0;}
        if(money === undefined){money = 0;}

        let data: any = {
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
                        name: "Join Position",
                        value: joinPos,
                        inline: true
                    },
                    {
                        name: "Rep Recieved",
                        value: rep,
                        inline: true
                    },
                    {
                        name: "Rep Given",
                        value: given,
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
            data.embed.fields.push({
                name: "Bio",
                value: bio
            });
        }

        let roleString = roleList.join(" ");
        if(roleString.length > 0){
            data.embed.fields.push({
                name: "Roles",
                value: roleString
            });
        }
        
        
        const acks = await Hyperion.managers.user.getAcks(target.id);
        let ack: Array<string> = [];
        if(acks.owner){ack.push("Owner");}
        if(acks.developer){ack.push("Developer");}
        if(acks.admin){ack.push("Global Admin");}
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
                    let mods = await Hyperion.managers.guild.getMods(ctx.guild.id);
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
            data.embed.fields.push({name: "Acknowledgements", value: ack.join(", ")});
        }
        return data;
    }
}
export default Whois;