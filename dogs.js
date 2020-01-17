const axios = require('axios');
const { Hyperion } = require("./main.js");



Hyperion.registerCommand("corgi", async (msg, args) => {
    axios
      .get(`https://dog.ceo/api/breed/corgi/cardigan/images/random`)
      .then(response => {
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `found a corgi`,
              image: {
                url: response.data.message
              },
              timestamp: new Date(),
              footer: {
                text: 'with dog.ceo'
              }
            }
          });
      });


},{
    description: "finds a cute corgi"

});
Hyperion.registerCommand("pug", async (msg, args) => {
    axios
      .get(`https://dog.ceo/api/breed/pug/images/random`)
      .then(response => {
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `found a pug`,
              image: {
                url: response.data.message
              },
              timestamp: new Date(),
              footer: {
                text: 'with dog.ceo'
              }
            }
          });
      });


},{
    description: "finds a cute pug",
    aliases: ["carti"]
});
Hyperion.registerCommand("chesapeake", async (msg, args) => {
    axios
      .get(`https://dog.ceo/api/breed/retriever/chesapeake/images/random`)
      .then(response => {
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `found a chesapeake retriever`,
              image: {
                url: response.data.message
              },
              timestamp: new Date(),
              footer: {
                text: 'with dog.ceo'
              }
            }
          });
      });


},{
    description: "finds a cute chesapeake retriever"

});
Hyperion.registerCommand("golden", async (msg, args) => {
    axios
      .get(`https://dog.ceo/api/breed/retriever/golden/images/random`)
      .then(response => {
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `found a golden retriever`,
              image: {
                url: response.data.message
              },
              timestamp: new Date(),
              footer: {
                text: 'with dog.ceo'
              }
            }
          });
      });


},{
    description: "finds a cute golden retriever"

});
Hyperion.registerCommand("lab", async (msg, args) => {
    axios
      .get(`https://dog.ceo/api/breed/labrador/images/random`)
      .then(response => {
        //console.log(response);
        msg.channel.createMessage({
            embed: {
              description: `found a lab`,
              image: {
                url: response.data.message
              },
              timestamp: new Date(),
              footer: {
                text: 'with dog.ceo'
              }
            }
          });
      });


},{
    description: "finds a cute lab"

});



