const mongoclient = require("mongodb").MongoClient;
const express = require("express");
const request = require("request");
const app = express();
const bodyparser = require("body-parser");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const configuration = new Configuration({
  apiKey: process.env.OPENAPI,
});
const openai = new OpenAIApi(configuration);



app.use(bodyparser.urlencoded({ extended: true }));

mongoclient
  .connect(
    process.env.MONGODB,
    {
      useUnifiedTopology: true,
    }
  )


  .then((client) => {
    console.log("Connected to databases");
    const db = client.db("DiabDB");
    const userCollection = db.collection("userCollection");
    app.set("view engine", "ejs");
    app.get("/", (req, res) => {
      res.render("index");
    });
    app.get("/AI", (req, res) => {
      res.render("ai.ejs", { userDATA: null, error: null });
    });
    app.get("/chatbot",(req,res)=>{
   res.render("chatbot.ejs", { data: null, error: null });
    })
    app.post("/chatbot", (req, res) => {
      start();
      async function start() {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt:
            `I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown".\n\nQ: What is human life expectancy in the United States?\nA: Human life expectancy in the United States is 78 years.\n\nQ: Who was president of the United States in 1955?\nA: Dwight D. Eisenhower was president of the United States in 1955.\n\nQ: Which party did he belong to?\nA: He belonged to the Republican Party.\n\nQ: What is the square root of banana?\nA: Unknown\n\nQ: How does a telescope work?\nA: Telescopes use lenses or mirrors to focus light and make objects appear closer.\n\nQ: Where were the 1992 Olympics held?\nA: The 1992 Olympics were held in Barcelona, Spain.\n\nQ: How many squigs are in a bonk?\nA: Unknown\n\nQ: ${req.body.question}\nA:`,
          temperature: 0,
          max_tokens: 100,
          top_p: 1,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          stop: ["\n"],
        });

        

          res.render("chatbot.ejs", {
            data: response.data.choices[0].text,
          });
      }
      
    
      
    });
    app.post("/chatbot",(req,res)=>{
      
    })
    app.listen(3000, () => {
      console.log("The server has begun!");
    });
    app.get("/finddoctors", (req, res) => {
      res.render("doctors.ejs", {
        doctors: null,
        error: null,
        dataFound: undefined,
      });
    });
    app.post("/finddoctors", (req, res) => {
    

        const options = {
          method: "GET",
          url: "https://local-business-data.p.rapidapi.com/search-nearby",
          qs: {
            query: `doctors near me in ${req.body.location}`,
            lat: '',
            lng: '',
            limit: "20",
            language: "en",
          },
          headers: {
            "X-RapidAPI-Key":
             process.env.RAPIDAPI,
            "X-RapidAPI-Host": "local-business-data.p.rapidapi.com",
            useQueryString: true,
          },
        };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          let doctorsData = JSON.parse(body);
          console.log(doctorsData);
          let dataFoundResult = true;
          if (doctorsData.data == null) {
            dataFoundResult = false;
          }
          console.log(doctorsData.data);
          res.render("doctors.ejs", {
            doctors: doctorsData.data,
            error: null,
            dataFound: dataFoundResult,
          });
        });
      
    });
    app.get("/healthreport", (req, res) => {
      res.render("report.ejs", { userData: null });
    });
    app.post("/healthreport", (req, res) => {
      userCollection
        .find({ email: req.body.email })
        .toArray()
        .then((user) => {
          console.log(user);
          res.render("report.ejs", { userData: user });
        })
        .catch((err) => console.log(err));
    });
    app.post("/AI", (req, res) => {
      var submittedData = {
        name: req.body.name,
        email: req.body.mail,
        Age: req.body.age,
        Gender: req.body.gender,
        "Junk Food": req.body.food,
        Water: req.body.water,
        Weight: req.body.weight,
        "Increased Thirst": req.body.thirst,
        "Frequent Urination": req.body.urinate,
        "Frequent Hunger": req.body.hunger,
        "Frequently Lethargic": req.body.lethargic,
        "Blurred Vision": req.body.vision,
        "Slow Healing": req.body.healing,
        "Frequent Infection": req.body.infection,
        Numbness: req.body.numbness,
        "Darkened Skin": req.body.skin,
        Income: req.body.income,
        "Living Condition": req.body.living,
        Exercise: req.body.exercise,
      };
      var DATA = {
        Age: req.body.age,
        Gender: req.body.gender,
        "Junk Food": req.body.food,
        Water: req.body.water,
        Weight: req.body.weight,
        "Increased Thirst": req.body.thirst,
        "Frequent Urination": req.body.urinate,
        "Frequent Hunger": req.body.hunger,
        "Frequently Lethargic": req.body.lethargic,
        "Blurred Vision": req.body.vision,
        "Slow Healing": req.body.healing,
        "Frequent Infection": req.body.infection,
        Numbness: req.body.numbness,
        "Darkened Skin": req.body.skin,
        Income: req.body.income,
        "Living Condition": req.body.living,
        Exercise: req.body.exercise,
      };
      const options = {
        url: "https://askai.aiclub.world/2124f248-3ecc-4f02-929e-f573cb93fad0",
        method: "POST",
        body: JSON.stringify(DATA),
      };
      request(options, function (error, response, body) {
        if (error) {
          res.render("index", {
            userDATA: null,
            error: "Error Please try again",
          });
        } else {
          if (!body) userData = {};
          if (typeof body === "object") userData = body;
          if (typeof body === "string") userData = JSON.parse(body);
          let newdata = JSON.parse(userData.body);

          res.render("ai.ejs", { userDATA: newdata, error: null });
          submittedData["prediction"] = newdata.predicted_label;
          userCollection
            .insertOne(submittedData)
            .then((result) => {
              console.log(result);
            })
            .catch((error) => console.log(error));
        }
      });
    });
  });
