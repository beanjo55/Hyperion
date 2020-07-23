import {Role, Collection} from "eris";



export function sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>): Array<Role>{
    const userRolesObject: Array<Role> = [];
    userRoles.forEach((uRole: string) => {
        const temp = guildRoles.get(uRole);
        if(temp !== undefined){userRolesObject.push(temp);}
    });
    return userRolesObject.sort((a, b) => b.position - a.position);
}

export function getColor(roles: Collection<Role>, guildRoles: Collection<Role>): number{
    const colored = roles.filter((r: Role) => r.color !== 0).map((r: Role) => r.id);
    const sorted = sortRoles(colored, guildRoles);
    if(!sorted){return 0;}
    if(!sorted[0]){return 0;}
    return sortRoles(colored, guildRoles)[0].color;
}

export function resolveRole(input: string, roles: Collection<Role>): Role | undefined{
    input = input.toLowerCase();
    let role = roles.get(input);
    if(!role){
        role = roles.find(r => r.name === input);
    }
    if(!role){
        role = roles.find(r => r.name.toLowerCase().startsWith(input));
    }
    return role;
}
