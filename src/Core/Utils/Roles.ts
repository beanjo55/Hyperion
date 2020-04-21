
// eslint-disable-next-line no-unused-vars
import {Role, Collection} from "eris";



function sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>){
    let userRolesObject: Array<Role> = [];
    userRoles.forEach((uRole: string) => {
        let temp = guildRoles.get(uRole);
        if(temp !== undefined){userRolesObject.push(temp);}
    });
    return userRolesObject.sort((a, b) => b.position - a.position);
}

function getColor(roles: Collection<Role>, guildRoles: Collection<Role>){
    let colored = roles.filter((r: Role) => r.color !== 0).map((r: Role) => r.id);
    let sorted = sortRoles(colored, guildRoles);
    if(!sorted){return;}
    if(!sorted[0]){return;}
    return sortRoles(colored, guildRoles)[0].color;
}

export {sortRoles as sr};
export {getColor as gc};