// eslint-disable-next-line no-unused-vars
import {Guild, Member, Role, Message, Collection} from "eris";








function resolveUser(msg: Message, search: string, members: Collection<Member>): Member | undefined{
    if(!(msg.channel.type === 0 || msg.channel.type === 5)){ return;}
    if(!members){
        members = msg.channel.guild.members;
    } 
    let member = members.find(user => (`${user.username}#${user.discriminator}` === search) || (user.id === search) ||
        (user.username === search) || (msg.mentions[0] && user.id === msg.mentions[0].id) || (user.nick != undefined && user.nick === search));

    if (member == undefined) member = members.find(user => (user.username.toLowerCase() + "#" + user.discriminator === search.toLowerCase()) ||
        (user.username.toLowerCase() === search.toLowerCase()) || (user.nick != undefined && user.nick.toLowerCase() === search.toLowerCase()));

    if (member == undefined) member = members.find(user => (user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.nick != undefined && user.nick.toLowerCase().includes(search.toLowerCase())));
    return member;
}

function hoistUserResolver(msg: Message, search: string, members: Collection<Member>): Member | undefined{
    if(!(msg.channel.type === 0 || msg.channel.type === 5)){ return;}
    if(!search){
        return undefined;
    }

    let guild = msg.channel.guild;

    let member = undefined;

    let hoistRoles = guild.roles.filter((r: Role) => r.hoist).sort((a: Role, b: Role) => b.position - a.position);
    hoistRoles.forEach((hRole: Role) => {
        let memberset = members.filter(m => m.roles.includes(hRole.id));
        let tempSet = new Collection(Member);
        memberset.forEach((m: Member) => {
            tempSet.add(m);
        });
        member = resolveUser(msg, search, tempSet);
    });

    if(!member){
        member = resolveUser(msg, search, members);
    }
    return member;
}

export {hoistUserResolver as hur};
export {resolveUser as ur};