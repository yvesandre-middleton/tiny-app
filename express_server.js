// Set Api's, middleware and options to be used
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bcrypt = require('bcrypt');

// Use this function to generate a random string for shortURL and user ID
function generateShortUrl() {
   const vocabulary = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "x", "y", "z"];
   let output = "";
   for (let i = 0; i < 6; i++) {
       let index = getRandomInt();
       output += vocabulary[index];
   }
   return output;
}
// This function is used as part of the generate short URL function to create a random string
function getRandomInt() {
   min = Math.ceil(0);
   max = Math.floor(25);
   return Math.floor(Math.random() * (25 - 0)) + 0;
}

// This function checks is the URL starts with http:// and if not adds it making sure
// redirect functionality doesn't break
function checkUrl(longURL) {
  var check = longURL.match(/^https?:\/\//);
  if (check !== null) {
    return longURL;
  } else {
    return "http://" + longURL;
  }
}

// This function updates the Urls so that the users id is embedded
function updateUserURLS (id) {
  const userURLS = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].userID == id ) {
      // console.log(urlDatabase[key])
      userURLS[key] = urlDatabase[key];
    }
  // console.log(userURLS);
  return userURLS
}
console.log(updateUserURLS());

app.set("view engine", "ejs");

var urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "b2xVn2": {
      // userID: tu46468r426,
      // longURL: "http://www.lighthouselabs.ca",
  // }
};

const users = {
 //  "userRandomID": {
 //    id: "userRandomID",
 //    email: "user@example.com",
 //    password: "purple-monkey-dinosaur"
 //  },
 // "user2RandomID": {
 //    id: "user2RandomID",
 //    email: "user2@example.com",
 //    password: "dishwasher-funk"
 //  }
}

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session["user_id"]]};
  console.log("urls/login", templateVars)
  res.render("urls/login", templateVars)
})

app.post("/register", (req, res) => {
  var email = req.body.email
  const password = bcrypt.hashSync(req.body.password, 10);
  for (key in users) {
    if(users[key].email === email) {
      console.log("duplicate found");
      res.render("urls/urls_register", {errorMessage: "Please choose another username."})
      return
    }
  }
  var id = generateShortUrl();
  // res.cookie('user_id', id);
  req.session.user_id = id

  users[id] = {id: id, email: email, password: password }
  // console.log("email>>", email)
  // console.log("password>>", password)
  console.log("users>>", users)
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  console.log("urls/urls_register", {errorMessage: ''})
  res.render("urls/urls_register", {errorMessage: ''})
})

app.post("/logout/", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  var email = req.body.email
  var password = req.body.password
  for (key in users) {
    if(users[key].email === email && bcrypt.compareSync(password, users[key]['password'])) {
      req.session.user_id = key
      res.redirect('/urls')
      return
    }
  }
  res.status(401).send('NOT AUTH')
})

app.post("/urls/:id/delete", (req, res) => {
// console.log("Remind me to delete ",req.params.id)
// console.log(urlDatabase[req.params.id])
let takeOut = req.params.id
const user_id = req.session.user_id
for (let key in urlDatabase) {
  if (key === takeOut && urlDatabase[key].userID === user_id) {
    delete urlDatabase[req.params.id];
  }
}
res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  console.log("Remind me to delete ", req.params.id)
  let shortURL = req.params.id
  let longURL = req.body.longURL
  let user_id = req.session.user_id
console.log("id>>>", urlDatabase[shortURL].userID)
console.log("whyyy", user_id)
  // urlDatabase
  // for (let key in urlDatabase) {
    if(urlDatabase[shortURL].userID === user_id) {
      urlDatabase[shortURL].longURL = longURL
    }
  // }
  res.redirect(/urls/);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // shortURL points to the key of th objects found in urlDatabase
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL].longURL;
  console.log(longURL)
  // console.log(longURL)
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.session["user_id"]]};
  const user = req.session.user_id;
  console.log("urls/urls_new", templateVars)
  if (users[user]) {
      res.render("urls/urls_new", templateVars);
    } else {
      res.redirect("/login");
    }
  });

app.post("/urls", (req, res) => {
  var shortURL = generateShortUrl();
  var longURL = checkUrl(req.body.longURL);
  urlDatabase[shortURL] = {
    userID: req.session["user_id"],
    longURL: longURL
  };
  console.log(urlDatabase[shortURL]);  // debug statement to see POST parameters
  res.redirect("/urls/");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
    user: users[req.session["user_id"]]};
    console.log("urls/urls_show", templateVars)
  res.render("urls/urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id
  const userURL = updateUserURLS(user_id)
  let templateVars = { urls: userURL,
    user: users[req.session["user_id"]]};
  if (users[user_id]) {
    res.render("urls/urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
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
  console.log(urlDatabase)
  res.json(urlDatabase);
});



