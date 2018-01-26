// Set Api's, middleware and options to be used
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
      userURLS[key] = urlDatabase[key];
    }
  return userURLS;
}

let urlDatabase = {

};

let users = {

}

// Here we render our Login Page
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session["user_id"]]};
  res.render("urls/login", templateVars);
})

// Here we post our form to the register page. If a user exists already an error message pops up
app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  for (key in users) {
    if(users[key].email === email) {
      res.render("urls/urls_register", {errorMessage: "Please choose another username."})
      return;
    }
  }
  let id = generateShortUrl();
  req.session.user_id = id
  users[id] = {id: id, email: email, password: password }
  res.redirect("/urls");
})

// Here we render the register page
app.get("/register", (req, res) => {
  res.render("urls/urls_register", {errorMessage: ''})
})

// Here we post a form when we logout deleting cookies
app.post("/logout/", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

// Here we post to the login form. if a user and password exists it logs in and redirects to
// url page
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (key in users) {
    if(users[key].email === email && bcrypt.compareSync(password, users[key]['password'])) {
      req.session.user_id = key;
      res.redirect('/urls');
      return;
    }
  }
  res.status(401).send('NOT AUTH');
})

// Here we delete our url when a button is clicked
// If a user is not logged in this function is disabled
app.post("/urls/:id/delete", (req, res) => {
let takeOut = req.params.id;
const user_id = req.session.user_id;
for (let key in urlDatabase) {
  if (key === takeOut && urlDatabase[key].userID === user_id) {
    delete urlDatabase[req.params.id];
  }
}
res.redirect("/urls");
});

// Here post the new short url and identifying longurl to the user database to associate
// with a user
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = checkUrl(req.body.longURL);
  let user_id = req.session.user_id;
    if(urlDatabase[shortURL].userID === user_id) {
      urlDatabase[shortURL].longURL = longURL
    }
  res.redirect(/urls/);
});

// Here redirect to our stored long url
// shortURL points to the key of the objects found in urlDatabase
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Here we render our page where you can input a new url to be shortened
// If you are not logged in this page is inaccessible
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.session["user_id"]]};
  const user = req.session.user_id;
  if (users[user]) {
      res.render("urls/urls_new", templateVars);
    } else {
      res.redirect("/login");
    }
  });

// Here we post our new short url and associated long url to the database
app.post("/urls", (req, res) => {
  let shortURL = generateShortUrl();
  let longURL = checkUrl(req.body.longURL);
  urlDatabase[shortURL] = {
    userID: req.session["user_id"],
    longURL: longURL
  };
  res.redirect("/urls/");
});

// Here we get can edit a short url
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
    user: users[req.session["user_id"]]};
  res.render("urls/urls_show", templateVars);
});

// This renders our URL page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURL = updateUserURLS(user_id);
  let templateVars = { urls: userURL,
    user: users[req.session["user_id"]]};
  if (users[user_id]) {
    res.render("urls/urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// This sets our default homepage to a message saying Hello!
app.get("/", (req, res) => {
  res.end("Hello!");
});


// This tells us in terminal what port we are listening on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// This gets our json
app.get("/urls.json", (req, res) => {
  console.log(urlDatabase);
  res.json(urlDatabase);
});


// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });





