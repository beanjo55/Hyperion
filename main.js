/* eslint-disable no-unused-vars */



const fs = require("fs");

const mongoose = require('mongoose');
const Eris = require("eris");
const config = require("./config.json");
const Hyperion = new Eris(config.token, {
    restMode: true,
    getAllUsers: true
});

const { command } = require("./command.js");

Hyperion.commands = new Eris.Collection(command);
mongoose.connect('mongodb://localhost/Hyperion', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("db connected");
});

const { Guild } = require('./Models/guild.js');

Hyperion.db = db;
//exports.Hyperion = Hyperion;



/*
Hyperion.registerCommand("role", async (msg, args) =>{
    const userPerms = await msg.channel.guild.getRESTMember(msg.author.id);
    let member = null;
    let role = null;
    let botMemb = await msg.channel.guild.getRESTMember(Hyperion.user.id);
    if (!(userPerms.permission.has("administrator") || userPerms.permission.has("manageRoles"))) {
        Hyperion.createMessage(msg.channel.id, "You don't have permission to manage roles, please check your permissions and try again");
        return;
    }
    if (!(botMemb.permission.has("administrator") || botMemb.permission.has("manageRoles"))) {
        Hyperion.createMessage(msg.channel.id, "I don't have permission to manage roles, please check my permissions and try again");
        return;
    }
    if(args.length >2){
        Hyperion.createMessage(msg.channel.id, "Too many arguments given, I just need a user and a role");
        return;
    }
    if(args.length<2){
        Hyperion.createMessage(msg.channel.id, "Too few arguments given, I need a user and a role");
        return;
    }
    //console.log(args[1]);
    let uIDt = args[0].match(/^\d+$/);
    let rIDt = args[1].match(/^\d+$/);
    console.log("post match");
    if(msg.mentions.length !== 0){
        member = await msg.channel.guild.getRESTMember(msg.mentions[0].id);
        console.log("user by mention");
    }else{
        if(uIDt !== null){
            let uID = uIDt[0];
            member = await msg.channel.guild.getRESTMember(uID);
            console.log("user by id");
        }else{
            Hyperion.createMessage(msg.channel.id, "I'm not sure who that is, try a user ID or mention them");
            return;
        }

    }
    if(member === null){
        Hyperion.createMessage(msg.channel.id, "member is still null after checks, this shouldnt happen");
        console.log("bad member - role");
        console.log(args);
        return;
    }
    if(msg.roleMentions.length !== 0){
        role = await msg.channel.guild.roles.find(roleC => roleC.id === msg.roleMentions[0]);
        console.log("role by mention");
    }else{
        if(rIDt !== null){

            console.log("role by id");
            let rID = rIDt[0];
            role = await msg.channel.guild.roles.find(roleC => roleC.id === rID);
        }else{
            Hyperion.createMessage(msg.channel.id, "I dont know what role that is, try a role ID or mention the role");
            return;
        }
    }
    if(role === null || role === undefined){
        Hyperion.createMessage(msg.channel.id, "role is still null/undefined after checks, this shouldnt happen");
        console.log("bad role - role");
        console.log(args);
        return;
    }
    console.log("pos check");
    let bRoleObjA = [];
    botMemb.roles.forEach(rol =>  {
        console.log(rol);
        let temp = msg.channel.guild.roles.find(roleC => roleC.id === rol);
        bRoleObjA.push(temp);
        
    });   
    console.log("is higher");
    let isHigher = false;
    console.log(bRoleObjA);
    //console.log(bRoleObjA[0].position);
    bRoleObjA.forEach(element => {
        console.log(element.position);
        console.log(role.position);
        if(element.position > role.position){
            isHigher = true;
        }
    });
    console.log("checked higher");
    if(isHigher===false){
        Hyperion.createMessage(msg.channel.id, "My role isnt high enough to manage that role, move my role higher and try again");
        return;
    }
    console.log("finished checks");
    try{
        console.log("try catch");
        if(member.roles.includes(role.id)){
            msg.channel.guild.removeMemberRole(member.id, role.id);
            Hyperion.createMessage(msg.channel.id, "Removed the " + role.name + " role from " + member.username);
            return;
        }else{
            msg.channel.guild.addMemberRole(member.id, role.id);
            Hyperion.createMessage(msg.channel.id, "Gave the " + role.name + " role to " + member.username);
            return;
        }
    }catch(err){
        Hyperion.createMessage(msg.channel.id, "Something went wrong, check the log for more details or contact <@253233185800847361>");
        console.log(err);
        return;
    }
    
},{
    desrciption: "add and remove roles"


});
*/

const load = () => {
    fs.readdir("./commands/", (err, files) => {
        
        files.forEach((file, index) => {
            
            const filepath = "./commands/" + file;
            console.log(filepath);
            const cmd = require(filepath);
            const newCmd = new cmd.cmd();
            Hyperion.commands.add(newCmd);
        });
    });
}


Hyperion.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});




function checkRequiredUsers(cmd, msg){
    return cmd.requiredUsers.includes(msg.author.id);
}

function checkRequiredGuilds(cmd, msg){
    return cmd.requiredGuilds.includes(msg.channel.guild.id);
}



Hyperion.on("messageCreate", async (msg) => {

    if(msg.channel.type === 1){
        if(msg.author.id === Hyperion.user.id){return;}
        const data = {
            embed: {
                author: {
                    name: "DM from: " + msg.author.username + "#" + msg.author.discriminator,
                    icon_url: msg.author.avatarURL
                },
                description: msg.content,
                timestamp: new Date()

            }
        };
        Hyperion.createMessage("663570766499020830", data);
        return;
        
    }
    /*
    let prefix = Hyperion.guildModel.findOne({'guildID': msg.channel.guild.id}, 'prefix', function(err, guilds){
        if(err){
            console.log(`prefix error on guild ${msg.channel.guild.id}`);
            console.log(err);
        }
        //prefix = guilds.prefix[0];
        console.log(guilds.prefix[0])
        return guilds.prefix[0];
    });*/

    const aprefix = await Hyperion.guildModel.findOne({'guildID': msg.channel.guild.id}, 'prefix').exec();

    let prefix = aprefix.prefix[0];

    if(msg.author.bot){
        return;
    }

    if(config.blacklist.includes(msg.author.id)){
        console.log("attempt from blacklisted user");
        return;
    }

    let contentClean = msg.content.replace(/<@!/g, "<@");
    if((contentClean.startsWith(Hyperion.user.mention) || msg.content.startsWith(prefix))){
        //console.log(prefix);
        let args = null;
        let cmdLabel = "";
        if(contentClean.startsWith(Hyperion.user.mention)){
            args = msg.content.split(" ").slice(2);

            const cmdLabelar = contentClean.split(" ").slice(1, 2);
            cmdLabel = cmdLabelar[0].trim().toLowerCase();
        }
        else{
            args = msg.content.split(" ").slice(1);

            const cmdLabelar = msg.content.split(" ").slice(0, 1);
            cmdLabel = cmdLabelar[0].slice(prefix.length).toLowerCase();
        }
        if(cmdLabel === "help"){
            if(args.length > 0){
                const found = Hyperion.commands.find(com => (com.name === args[0]) || (com.aliases.includes(args[0])));
                const data = {
                    embed: {
                        description: found.helpInfo,
                        color: 0xe87722,
                        timestamp: new Date(),
                        title: `Help for ${found.name}`
                    }
                }
                msg.channel.createMessage(data);
                return;
            }else{
                let list = Hyperion.commands.map(com => (com.name));
                const data = {
                    embed: {
                        color: 0xe87722,
                        timestamp: new Date(),
                        title: "Commands",
                        description: list.join("\n")
                    }
                }
                msg.channel.createMessage(data);
                return;
            }
        }
        const found = Hyperion.commands.find(com => (com.name === cmdLabel) || (com.aliases.includes(cmdLabel)));
        if(found != undefined){

            

            
            if(found.requiredUsers.length != 0){
                const check = checkRequiredUsers(found, msg);
                if(!check){
                    return;
                }
            }
            
            if(found.requiredGuilds.length != 0){
                const check = checkRequiredGuilds(found, msg);
                if(!check){
                    return;
                }
            }

            if(found.requiredPerms.length != 0){
                let canRun = false;
                found.requiredPerms.forEach((perm) => {
                    if(msg.member.permission.has(perm)){
                        canRun = true;
                    }
                });
                if(canRun == false){
                    return;
                }
            }

            found.execute(msg, args, Hyperion);

        }






    }
    if((msg.author.id === "253233185800847361") && (msg.content.startsWith("$h"))){

        prefix = "$h";

        if(msg.author.bot){
            return;
        }
    
        let contentClean = msg.content.replace(/<@!/g, "<@");
        let args = null;
        let cmdLabel = "";

        args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        cmdLabel = cmdLabelar[0].slice(prefix.length).toLowerCase();

        if(cmdLabel === "help"){
            if(args.length > 0){
                const found = Hyperion.commands.find(com => (com.name === args[0]) || (com.aliases.includes(args[0])));
                const data = {
                    embed: {
                        description: found.helpInfo,
                        color: 0xe87722,
                        timestamp: new Date(),
                        title: `Help for ${found.name}`
                    }
                }
                msg.channel.createMessage(data);
                return;
            }else{
                let list = Hyperion.commands.map(com => (com.name));
                const data = {
                    embed: {
                        color: 0xe87722,
                        timestamp: new Date(),
                        title: "Commands",
                        description: list.join("\n")
                    }
                }
                msg.channel.createMessage(data);
                return;
            }
        }
        const found = Hyperion.commands.find(com => (com.name === cmdLabel) || (com.aliases.includes(cmdLabel)));
        if(found != undefined){
            found.execute(msg, args, Hyperion);
    
        }
    }








    //if(msg.content.startsWith("<@253233185800847361>") || msg.content.startsWith("<@!253233185800847361>")){
    //    msg.channel.createMessage("https://cdn.discordapp.com/attachments/239446877953720321/333048272287432714/unknown.png");
    //}
    /*if(msg.content.toLowerCase().includes(config.aresp.trigger)){
        Hyperion.createMessage(msg.channel.id, config.aresp.response);
    }*/
});

Hyperion.on("guildCreate", (guild) => {
    //console.log(guild);
    registerGuild(guild);

});
Hyperion.on("warn", (info, sID) => {
    console.warn("warning on shard " + sID);
    console.warn(info);

});
const defualtPrefix = `%`
function registerGuild(guild){
    let newGuild = new Guild(
        {
            guildID: guild.id,
            prefix: defualtPrefix,
        }
    );
    newGuild.save(function (err) {
        if(err){
            console.log(`failed to save new guild: ${guild.id}`)
        }
    })

}
Hyperion.registerGuild = registerGuild;
Hyperion.guildModel = Guild;
/*
Hyperion.on("error", (err, id) => {
    console.log("error on shard: " + id);
    console.error(err);
});

Hyperion.on("guildAvailable", (guild) => {
    console.log(guild.name + " just became avalible");
});

Hyperion.on("guildUnavailable", (guild) => {
    console.log(guild.name + " just became unavalible");
});

Hyperion.on("hello", (trace, id) => {
    console.log("Hello shard " + id);
});

Hyperion.on("unknown", (packet, id) => {
    console.log("unknown packet on shard " + id);
});

Hyperion.on("debug", (msg, id) =>{
    if(!msg.includes("Duplicate presence update")){
        console.log(msg + "\n");
    }
});*/



load();
Hyperion.connect();