const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

function generateShortUrl() {
   const vocabulary = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "x", "y", "z"];
   let output = "";
   for (let i = 0; i < 6; i++) {
       let index = getRandomInt();
       output += vocabulary[index];
   }
   return output;
}

function getRandomInt() {
   min = Math.ceil(0);
   max = Math.floor(25);
   return Math.floor(Math.random() * (25 - 0)) + 0;
}



app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/logout/", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls")
})

app.post("/login/", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
// console.log("Remind me to delete ",req.params.id)
delete urlDatabase[req.params.id];
res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
// console.log("Remind me to delete ",req.params.id)
  var shortURL = req.params.id
  urlDatabase[shortURL] = req.body.longURL
  // console.log("whole object", urlDatabase);  // debug statement to see POST parameters
  // console.log("new id", req.params.id)
  // console.log("long url", req.body.longURL)
  // console.log(shortURL)
  res.redirect(/urls/);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // shortURL points to the key of th objects found in urlDatabase
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var shortURL = generateShortUrl();
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
    username: req.cookies["username"]};
  res.render("urls/urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies["username"] };
  res.render("urls/urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



