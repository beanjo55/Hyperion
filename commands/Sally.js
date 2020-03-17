const { command } = require('../command.js');

const sallys = ['https://cdn.discordapp.com/attachments/225182513465786369/660282554649149490/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/660188937704308778/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/660123365570510878/image0.jpg', 'https://cdn.discordapp.com/attachments/648349778429739009/659358356376649728/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/659037176977162261/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/658698790710018065/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/658324331792695296/image0.jpg', 'https://cdn.discordapp.com/attachments/648349778429739009/655913589785493534/sally8.JPG', 'https://cdn.discordapp.com/attachments/648349778429739009/655913462177857567/sally11.JPG', 'https://cdn.discordapp.com/attachments/225182513465786369/651987588999020544/image0.jpg', 'https://cdn.discordapp.com/attachments/225182513465786369/642381074932039681/image0.jpg', 'https://cdn.discordapp.com/attachments/513025490760630272/641096254558044161/image0.jpg', 'https://media.discordapp.net/attachments/225182513465786369/664221237844770826/image0.jpg', "https://cdn.discordapp.com/attachments/410646817756151808/664847101187981322/image0.jpg"];



class Sally extends command{
    constructor(){
        super();
        this.name = "sally";
        this.id = this.name;
        this.helpInfo = "Shows Sally, a cute chocolate lab";
        this.commandType = "fun";

    }
    async execute(msg){
        const randomInt = Math.floor(Math.random(0, sallys.length) * sallys.length);
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `Found Sally!!!`,
              image: {
                url: sallys[randomInt]
              },
              color: 0xe87722,
              timestamp: new Date(),
              footer: {
                text: 'Sally uwu'
              }
            }
          
      });
    }
}
exports.cmd = Sally;