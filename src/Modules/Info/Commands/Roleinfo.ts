import {Command} from "../../../Core/Structures/Command";
import {CommandContext, HyperionInterface} from "../../../types";
import { Role, Member, Embed } from "eris";

class Roleinfo extends Command{
    constructor(){
        super({
            name: "roleinfo",
            module: "info",

            helpDetail: "Shows info about a role",
            helpUsage: "{prefix}roleinfo [role]",
            noExample: true
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface): Promise<string | {embed: Partial<Embed>}>{
        if(!ctx.args[0]){
            return "You need to tell me a role";
        }

        let role = ctx.guild.roles.get(ctx.args[0]);
        if(!role && ctx.msg.roleMentions && ctx.msg.roleMentions[0]){
            role = ctx.guild.roles.get(ctx.msg.roleMentions[0]);
        }
        if(!role){
            role = ctx.guild.roles.find((r: Role) => r.name.toLowerCase().startsWith(ctx.args.join(" ").toLowerCase()));
        }
        if(!role || role.id === ctx.guild.id){
            return "I couldnt find that role";
        }
        const frole: Role = role;

        const count = ctx.guild.members.filter((m: Member) => m.roles.includes(frole.id)).length;
        let color = Hyperion.defaultColor;
        if(role.color !== 0){
            color = role.color;
        }

        const data = {
            embed: {
                color: color,
                footer: {
                    text: `ID: ${role.id}`
                },
                timestamp: new Date,
                title: `Role Info - ${role.name}`,
                fields: [
                    {
                        name: "Members",
                        value: `${count} Members`,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `${new Date(role.createdAt).toDateString()}`,
                        inline: true
                    },
                    {
                        name: "Hoisted",
                        value: `${role.hoist}`,
                        inline: true
                    },
                    {
                        name: "Position",
                        value: `${role.position}`,
                        inline: true
                    },
                    {
                        name: "Mentionable",
                        value: `${role.mentionable}`,
                        inline: true
                    },
                    {
                        name: "Integrated",
                        value: `${role.managed}`,
                        inline: true
                    },
                    {
                        name: "Mention",
                        value: role.mention,
                        inline: true
                    }
                ]
            }
        };
        if(role.color !== 0){
            data.embed.fields.push({
                name: "Color",
                value: `${role.color}`,
                inline: true
            });
        }
        return data;

    }

}
export default Roleinfo;