const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
app.use(
  cookieSession({
    name: "user_id",
    keys: ["1", "2"]
  })
);
app.set("view engine", "ejs");

// creates random ID string
function generateRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}

//finds and returns the shortURL object with all the
function getUrlObject(shortURL) {
  return urlDatabase[shortURL];
}

//filters and displays the URLs by the User ID
function urlsForUser(id) {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  return urls;
}

// starting URL database
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "id1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "id2" }
};

// Starting User Database
const users = {
  id1: {
    id: "id1",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  id2: {
    id: "id2",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};

//page that lists all the URLs by the logged-in User
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let id = req.session.user_id;
    let email = users[id].email;
    if (id) {
      // find URLs created by the User and send them to be rendered on the page
      let urls = urlsForUser(id);
      let templateVars = { urls: urls, id: id, email: email };
      res.render("urls_index", templateVars);
    } else {
      res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
    }
  } else {
    res.redirect("/login");
  }
});

//go to New page, renders the new url ejs
app.get("/urls/new", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let email = users[id].email;
    let templateVars = { email: email, id: id };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Login page
app.get("/login", (req, res) => {
  let email = "";
  let id = req.session.user_id;
  let templateVars = { id: id, email: email };
  res.render("login", templateVars);
});

// root page which redirects to URL Listing Page
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("urls.json", (req, res) => {
  res.json(urlDatabase);
});

// see an individual URL's page. show their long and short URLs to the page so they can be accessed there
app.get("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    //if there's a session cookie, render the page
    let email = users[id].email;
    let templateVars = { email: email, id: id, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    // no cookie? no page.
    res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
  }
});

// on solo URL page, linked URL will send GET request to redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  // if there is no "http://" at the beginning of the longURL, this will add it.
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

// Open Registration page
app.get("/register", (req, res) => {
  let id = req.session.user_id;
  let templateVars = { urls: urlDatabase, id: id };
  res.render("registration", templateVars);
});

// new URL is given a Random String as its key and given values of the Creator's ID and LongURL
// all are inserted to the urlDatabase
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  let id = req.session.user_id;
  // key is random string, longURL is the complete URL, id is the user's id
  urlDatabase[short] = { longURL: long, userID: id };
  res.redirect("/urls/" + short);
});

// Assigned user can update their urls, but keep the short url key
app.post("/urls/:shortURL", (req, res) => {
  // checks if cookie id matches user id
  if (!getUrlObject(req.params.shortURL.userID) === req.session.user_id) {
    // match FAILS
    res.status(403).send('<p>Invalid email or password</p><a href="/urls">Go Back</a>');
  } else {
    // match SUCCESS
    let newLong = req.body.longURL;
    urlDatabase[req.params.shortURL].longURL = newLong;
    res.redirect("/urls");
  }
});

// only the owner can delete a specific Short URL listing
app.post("/urls/:shortURL/delete", (req, res) => {
  // checks if cookie id matches user id
  if (!getUrlObject(req.params.shortURL).userID === req.session.user_id) {
    // match FAILS
    res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
  } else {
    // match SUCCESS
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// login form
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (var key in users) {
    //checks user Database to see if both email and pw match
    if (email === users[key].email && bcrypt.compareSync(password, users[key].password)) {
      req.session.user_id = key;
      return res.redirect("/urls");
    }
  } // if loop above finishes with no result...
  res.status(403).send('<p>Invalid email or password</p><a href="/login">Go Back</a>');
});

// Creating and sending new user to the User Database
app.post("/register", (req, res) => {
  // if either email or password is left blank, return error
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!req.body.email || !req.body.password) {
    res.status(400).send('<p>Invalid email or password</p><a href="/register">Go Back</a>');
  } else {
    let found = false;
    for (let key in users) {
      if (users[key].email === req.body.email) {
        // if email already exists in db, found is no longer False
        found = true;
        res.status(400).send('<p>Invalid email or password</p><a href="/register">Go Back</a>');
      }
    }
    if (!found) {
      // only runs if found is False. This person doesn't exist! Make em!
      let id = generateRandomString();
      users[id] = { id: id, email: req.body.email, password: hashedPassword };
      req.session.user_id = id;
      res.redirect("/urls");
    }
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
