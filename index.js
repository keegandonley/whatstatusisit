require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");
const codes = require("./codes.json");
const { faker } = require("@faker-js/faker");

const phrases = [
  ", the current status is",
  "! That's a",
  "! The status is",
  ", now it's",
];

const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

(() => {
  const func = async () => {
    const def = new Date()
      .toLocaleTimeString("default", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .split(" ")[0];

    const splits = def.split(":");

    let hours = splits[0];
    const minutes = splits[1];

    /*
	  	01:10 -> 110
		11:30 -> 1130 (these won't match, intentionally)
		10:30 -> 1030 (these won't match, intentionally)
		01:30 -> 130
		01:00 -> 100
	 */
    if (hours[0] === "0") {
      hours = hours.replace("0", "");
    }

    const code = `${hours}${minutes}`;

    const found = codes[code];

    if (found) {
      const userClient = new TwitterApi({
        accessToken: process.env.ACCESS_TOKEN,
        accessSecret: process.env.ACCESS_SECRET,
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
      });

      const phraseIndex = randomInteger(0, phrases.length - 1);
      const startingPhrase = phrases[phraseIndex];
      const interjection = faker.word.interjection();
      const readMoreText = "Read more:";
      const link = found.spec_href;
      const code = found.code;
      const message = found.message;
      const description = found.description;

      const length =
        interjection.length +
        startingPhrase.length +
        1 +
        code.length +
        2 +
        message.length +
        3 +
        2 +
        readMoreText.length +
        1 +
        link.length;

      const remaining = 280 - length;
      let sliceEnd = -1;

      if (remaining < description.length) {
        const newRemaining = remaining - 3; // account for the ellipsis
        sliceEnd = newRemaining;
      }

      const str = `${interjection}${startingPhrase} ${code}: ${message}! (${
        sliceEnd >= 0 ? description.slice(0, sliceEnd) : description
      }${sliceEnd < 0 ? "" : "..."}) ${readMoreText} ${link}`;

      await userClient.v2.tweet(str);
    } else {
      console.log(code, "no match");
    }
  };
  func();
  setInterval(func, 60000);
})();
