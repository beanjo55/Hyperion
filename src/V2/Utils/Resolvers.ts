import {Member, Role, Collection, User, Guild} from "eris";
import { V2Type }  from "../../main";

export async function resolveUser(search: string, guild: Guild, members: Collection<Member>): Promise<Member | undefined>{
    if(!members){members = guild.members;}
    let member = members.get(search);
    if(member){return member;}
    const test = search.match(/<@!?(\d+)>/);
    if(test && test[1]){
        const temp = members.get(test[1]);
        if(!temp){
            const fetch = await guild.fetchMembers({userIDs: [test[1]], limit: 1});
            return fetch[0];
        }else{
            return temp;
        }
        
    }
    if(member === undefined) {
        member = members.find(user => (`${user.username}#${user.discriminator}` === search) || (user.id === search) ||
        (user.username === search)  || (user.nick !== undefined && user.nick === search));
    }

    if (member === undefined){
        member = members.find(user => (user.username.toLowerCase() + "#" + user.discriminator === search.toLowerCase()) ||
        (user.username.toLowerCase() === search.toLowerCase()) || (user.nick?.toLowerCase() === search.toLowerCase()));
    }

    if (member === undefined){
        member = members.find(user => (user.username.toLowerCase().includes(search.toLowerCase())) ||
        (!!user.nick && user.nick.toLowerCase().includes(search.toLowerCase())));
    }
    return member;
}


export async function hoistUserResolver(search: string, guild: Guild, members: Collection<Member>): Promise<Member | undefined>{
    if(!search){
        return;
    }
    const test = search.match(/<@!?(\d+)>/);
    if(test && test[1]){
        const temp = members.get(test[1]);
        if(!temp){
            const fetch = await guild.fetchMembers({userIDs: [test[1]], limit: 1});
            return fetch[0];
        }else{
            return temp;
        }
        
    }
    const hroles: Array<Role> = guild.roles.filter((r: Role) => r.hoist);
    hroles.sort((a: Role, b: Role) => b.position - a.position);
    for(let i = 0; i < hroles.length; i++){
        const r: Role = hroles[i];
        const tempColl = new Collection(Member);
        const tempArr = members.filter((m: Member) => (m.roles ?? []).includes(r.id));
        tempArr.forEach((m: Member) => {
            tempColl.add(m);
        });
        const pass: Member | undefined = await resolveUser(search, guild, tempColl);

        if(pass !== undefined){return pass;}
    }
    return await resolveUser(search, guild, members);
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

export async function banResolver(search: string, members: Collection<Member>, Hyperion: V2Type): Promise<Member | User | undefined>{
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

export async function op8(search: string, guild: Guild): Promise<Member | undefined>{
    const result = await guild.fetchMembers({query: search, limit: 50});
    if(result.length === 0){
        if(!isNaN(Number(search))){
            const idFetch = await guild.fetchMembers({userIDs: [search]});
            if(idFetch.length !== 0){
                return idFetch[0];
            }else{
                return;
            }
        }
    }
    const members = new Collection<Member>(Member);
    for(const m of result){members.add(m);}
    return await hoistUserResolver(search, guild, members);
}



