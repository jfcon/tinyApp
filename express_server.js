const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// creates shortened URL string
function generateRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}

// checks the user db for a correct and previously existing email and password.
function authenticateUser(email, password) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      return users[key];
    }
  }
}

//filters and displays the URLs by the User ID
function urlsForUser(id) {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  console.log(urls);
  return urls;
}

// tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

// starting URL database
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// User Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//page that lists all the URLs by the logged-in User
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    urls = urlsForUser(req.cookies["user_id"].id);
    let templateVars = { urls: urls, id: req.cookies["user_id"] };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
  }
});

//go to New page, renders the new url ejs
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = { id: req.cookies["user_id"] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Login page
app.get("/login", (req, res) => {
  let templateVars = { id: req.cookies["user_id"] };
  res.render("login", templateVars);
});

// root page which redirects to URL Listing Page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("urls.json", (req, res) => {
  res.json(urlDatabase);
});

// see an individual URL's page.
// pass through the long and short URLs to the page so they
// can be used there
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
  }
});

// on single URL page, linked URL will
// send GET request to redirect
// user to longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  // if there is no "http://" at the beginning of the
  // longURL, this will add it.
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

// Open Registration page
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, id: req.cookies["user_id"] };
  res.render("registration", templateVars);
});

// newly added URL (a new value) is given a Random String as a key.
// Both are inserted to the urlDatabase
// redirects to main url listing page
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  let id = req.cookies["user_id"];
  urlDatabase[short] = { longURL: long, userID: id.id };
  res.redirect("/urls/" + short);
});

// Updating a url, but keep the short url key
app.post("/urls/:shortURL", (req, res) => {
  let newLong = req.body.longURL;
  urlDatabase[req.params.shortURL] = newLong;
  res.redirect("/urls");
});

// deletes a specific key/value from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// login form
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = authenticateUser(email, password);
  if (user) {
    res.cookie("user_id", user);
    res.redirect("/urls");
  } else {
    res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
  }
});

// Sending new user to the User Database
app.post("/register", (req, res) => {
  // if either email or password is left blank, return error
  if (!req.body.email || !req.body.password) {
    res.status(400).send('<p>Invalid email or password</p><a href="/register">Go Back</a>');
  }
  if (authenticateUser(req.body.email)) {
    // if email already exists in db
    res.status(400).send('<p>Invalid email or password</p><a href="/register">Go Back</a>');
  } else {
    //if new user is 100% New
    let id = generateRandomString();
    users[id] = { id: id, email: req.body.email, password: req.body.password };
    res.cookie("user_id", users[id]);
    res.redirect("/urls");
  }
});

// logout clears the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// if app can run, console log will print a confirmation
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
