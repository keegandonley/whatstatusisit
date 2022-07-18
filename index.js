require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");
const codes = require("./codes.json");
const { faker } = require("@faker-js/faker");

(async () => {
  const func = async () => {
    // Instantiate with desired auth type (here's Bearer v2 auth)
    const userClient = new TwitterApi({
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_SECRET,
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
    });

    const def = new Date()
      .toLocaleTimeString("default", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .split(" ")[0];

    const hours = def.split(":")[0].replace("0", "");
    const minutes = def.split(":")[1];

    const code = `${hours}${minutes}`;

    const found = codes[code];

    if (found) {
      const str = `${faker.word.interjection()}! That's a ${found.code}: ${
        found.message
      }! (${found.description.slice(0, 130)}${
        found.description.length > 130 ? "..." : ""
      }) Read more: ${found.spec_href}`.slice(0, 280);
      await userClient.v2.tweet(str);
    } else {
      console.log(code, "no match");
    }
  };
  func();
  setInterval(func, 60000);
})();
