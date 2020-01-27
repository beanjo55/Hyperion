




const cleanMarkdown = text => {
    let rx = /`/g;
    let rx2 = /\*/g;
	if (typeof(text) === "string")
		// eslint-disable-next-line no-useless-escape
		return text.replace(rx, "\`").replace(rx2, "\*");
	else
		return text;
};

async function getGuildMember(id, guild){
	let memb = guild.members.find(mbr => mbr.id === id);
	if(!memb){
		memb = await guild.getRESTMember(id);
	}
	return memb;
}

function sortRoles(userRoles, guildRoles){
    let userRolesObject = [];
    userRoles.forEach(uRole => {
        userRolesObject.push(guildRoles.find(gRole => gRole.id === uRole));
    });
   return userRolesObject.sort((a, b) => b.position - a.position);
}
function resolveUser(msg, search){
	if (!search) return msg.member; //No specifier? Return message author.
    let members = msg.channel.guild.members; //Get members from guild. 
    let member = members.find(user => (`${user.username}#${user.discriminator}` === search) || (user.id === search) ||
        (user.username === search) || (msg.mentions[0] && user.id === msg.mentions[0].id) || (user.nick != undefined && user.nick === search));

    if (member == undefined) member = members.find(user => (user.username.toLowerCase() + '#' + user.discriminator === search.toLowerCase()) ||
        (user.username.toLowerCase() === search.toLowerCase()) || (user.nick != undefined && user.nick.toLowerCase() === search.toLowerCase()));

    if (member == undefined) member = members.find(user => (user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.nick != undefined && user.nick.toLowerCase().includes(search.toLowerCase())));
    return member;
}

function resolveRole(msg, search){
    if(!search) return;
    let roles = msg.channel.guild.roles

    let role = roles.find(rol => (role.name === search) || (role.id === search) || (msg.roleMentions[0] && rol.id === msg.roleMentions[0]))

    if(role == undefined){
        role = roles.find(rol => (rol.name.toLowerCase() === search.toLowerCase()));
    }

    if(role == undefined){
        role = roles.find(rol => (rol.name.toLowerCase().startsWith(search.toLowerCase())));
    }

    if(role == undefined){
        role = roles.find(rol => (rol.name.toLowerCase().includes(search.toLowerCase())));
    }

    return role;
}
exports.resolveUser = resolveUser;
exports.sortRoles = sortRoles;
exports.resolveRole = resolveRole;