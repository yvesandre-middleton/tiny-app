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

function checkUrl(longURL) {
  var check = longURL.match(/^https?:\/\//);
  if (check !== null) {
    return longURL;
  } else {
    return "http://" + longURL;
  }
}


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls/login", templateVars)
})

app.post("/register", (req, res) => {
  var email = req.body.email
  var password = req.body.password
  for (key in users) {
    if(users[key].email === email) {
      console.log("duplicate found");
      res.render("urls/urls_register", {errorMessage: "Please choose another username."})
      return
    }
  }
  var id = generateShortUrl();
  res.cookie('user_id', id);

  users[id] = {id: id, email: email, password: password }
  // console.log("email>>", email)
  // console.log("password>>", password)
  console.log("users>>", users)
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  res.render("urls/urls_register", {errorMessage: ''})
})

app.post("/logout/", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  var email = req.body.email
  var password = req.body.password
  for (key in users) {
    if(users[key].email === email && users[key].password === password) {
      res.cookie('user_id', key)
      res.redirect('/urls')
      return
    }
  }
  res.status(401).send('NOT AUTH')
})

app.post("/urls/:id/delete", (req, res) => {
// console.log("Remind me to delete ",req.params.id)
// console.log(urlDatabase[req.params.id])
delete urlDatabase[req.params.id];
res.redirect("/urls")

});

app.post("/urls/:id", (req, res) => {
// console.log("Remind me to delete ",req.params.id)
  var shortURL = req.params.id
  urlDatabase[shortURL] = "http://www." + req.body.longURL
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
  // console.log(longURL)
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls/urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateShortUrl();
  var longURL = checkUrl(req.body.longURL);
  urlDatabase[shortURL] = longURL
  // console.log(urlDatabase[shortURL]);  // debug statement to see POST parameters
  res.redirect(/urls/);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
    user: users[req.cookies["user_id"]]};
  res.render("urls/urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies["user_id"]]};
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



