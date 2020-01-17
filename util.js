




const cleanMarkdown = text => {
    let rx = /`/g;
    let rx2 = /\*/g;
	if (typeof(text) === "string")
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

exports.sortRoles = sortRoles;