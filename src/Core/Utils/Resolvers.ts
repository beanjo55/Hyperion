// eslint-disable-next-line no-unused-vars
import {Member, Role, Message, Collection, User} from "eris";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import  HyperionC  from "../../main";








export function resolveUser(msg: Message, search: string, members: Collection<Member>): Member | undefined{
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

// eslint-disable-next-line no-unused-vars
export function hoistUserResolver(msg: Message, search: string, members: Collection<Member>): Member | undefined{
    if(!(msg.channel.type === 0 || msg.channel.type === 5)){ return;}
    if(!search){
        return undefined;
    }

    const guild = msg.channel.guild;
    const hroles: Array<Role> = guild.roles.filter((r: Role) => r.hoist);
    hroles.sort((a: Role, b: Role) => b.position - a.position);
    for(let i = 0; i < hroles.length; i++){
        const r: Role = hroles[i];
        const tempColl = new Collection(Member);
        const tempArr = members.filter((m: Member) => m.roles.includes(r.id));
        tempArr.forEach((m: Member) => {
            tempColl.add(m);
        });
        const pass: Member | undefined = resolveUser(msg, search, tempColl);

        if(pass !== undefined){return pass;}
    }
    return resolveUser(msg, search, members);
}

export function strictResolver(search: string, members: Collection<Member>, ): Member | undefined{
    let member = members.get(search);
    const test = search.match(/<@!?(\d+)>/);
    if(test && test[1]){
        search = test[1];
        member = members.get(search);
    }
    if(!member){
        member = members.find((M: Member) => search === `${M.username}#${M.discriminator}`);
    }
    if(!member){
        member = members.find((M: Member) => search === M.username);
    }
    return member;
}

export async function banResolver(search: string, members: Collection<Member>, Hyperion: HyperionC): Promise<Member | User | undefined>{
    let user: User | Member | undefined;
    user = strictResolver(search, members);
    if(!user){
        user = Hyperion.client.users.get(search);
    }
    if(!user){
        try{
            user = await Hyperion.client.getRESTUser(search);
        // eslint-disable-next-line no-empty
        }catch{}
    }
    return user;
}



