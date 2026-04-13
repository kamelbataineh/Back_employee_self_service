const axios = require("axios");

async function translate(text, target) {
  try {
    const res = await axios.get(
      "https://translate.googleapis.com/translate_a/single",
      {
        params: {
          client: "gtx",
          sl: "en",
          tl: target,
          dt: "t",
          q: text,
        },
      },
    );

    return res.data[0][0][0];
  } catch (err) {
    console.log("Translation error:", err.message);
    return text;
  }
}

async function translateName(name) {
  const text = typeof name === "object" ? name.en : name;

  const ar = await translate(text, "ar");
  const fr = await translate(text, "fr");

  return {
    en: text,
    ar,
    fr,
  };
}

module.exports = translateName;
