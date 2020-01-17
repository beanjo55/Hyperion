
const { command } = require('../command.js');
const { sortRoles } = require("../util.js");
//const { Hyperion } = require("../main.js");




/*
function sortRoles(userRoles, guildRoles){
    let userRolesObject = [];
    userRoles.forEach(uRole => {
        userRolesObject.push(guildRoles.find(gRole => gRole.id === uRole));
    });
    
    let sorteduserRoles = [];
    sorteduserRoles.length = userRolesObject.length;
    for(let i = 0; i<userRolesObject.length; i++){
        let higherThan = 0;
        for(let j = 0; j<userRolesObject.length; j++){
            if(userRolesObject[j].position > userRolesObject[i].position){
                higherThan++;
            }
        }
        sorteduserRoles[higherThan] = userRolesObject[i]; 
    }
    
    return sorteduserRoles;
    
   return userRolesObject.sort((a, b) => b.position - a.position);
}*/

class Whois extends command{
    constructor(){
        super();
        this.name = "whois";
        this.aliases = ["w", "userinfo"];
        this.id = this.name;
        this.helpInfo = "Gets information about yourself or another user";
    }
    async execute(msg, args){
        let memb = null;
        if(args.length != 0){
            if(msg.mentions.length != 0){
                memb = await msg.channel.guild.getRESTMember(msg.mentions[0].id);
            }
            else{
                let uIDt = args[0].match(/^\d+$/);
                if(uIDt !== null){
                    let uID = uIDt[0];
                    memb = await msg.channel.guild.getRESTMember(uID);
                } else{
                    msg.channel.createMessage("I'm not sure who that is, try a user ID or mention them");
                    return;
                }
            }
        }
        else{
            memb = msg.member;
        }
        const jat = new Date(memb.joinedAt);
        const cat = new Date(memb.createdAt);
        let sortedList = [];

        let roleList = "";
        if(memb.roles.length === 0){
            roleList = "None";
        }else{
            sortedList = sortRoles(memb.roles, memb.guild.roles);
            //console.log(sortedList);
            roleList = sortedList.map(rol => rol.mention).join(", ");
        }

        let rColor = 15234850;
        if(sortedList.length > 0){
            let colorList = sortedList.filter(rol => rol.color != 0).map(rol => rol.color);
            if(colorList.length != 0){
                rColor = colorList[0];
            }
        }
        

        const data = {
            embed: {
                 thumbnail: {
                     url: memb.avatarURL
                 },
                 author: {
                     name: memb.username + "#" + memb.discriminator,
                     icon_url: memb.avatarURL
                 },
                 color: rColor.valueOf(),
                 fields: [
                     {
                         name: "created at",
                         value: cat.toDateString(),
                         inline: true
                     },
    
                     {
                         //do not fix typo
                        name: "joinedat",
                        value: jat.toDateString(),
                        inline: true
                    },
                    {
                        name: `Roles [${memb.roles.length}]`,
                        value: roleList,
                    }
                 ]
            }
        }





        msg.channel.createMessage(data);
    }





}
exports.cmd = Whois;