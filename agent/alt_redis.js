const redis = require("redis");
const client = redis.createClient();

client.on("error", function(error) {
  console.error(error);
});

user = {name: 'vasya', login: 'ko12121lya'};

client.set("key", JSON.stringify(user));
client.get("key", (err, reply)=> {
  console.log(JSON.parse(reply));
});