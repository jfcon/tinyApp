var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// creates shortened URL string
function generateRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}

// tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

// starting database
var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// templateVars contains the whole object urlDatabase,
// templateVars gets taken/rendered to urls_index
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//go to New page, renders the new.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// newly added URL (a new value) is given a Random String as a key.
// Both are inserted to the urlDatabase
// redirects to main url listing page
app.post("/urls", (req, res) => {
  var short = generateRandomString();
  var long = req.body.longURL;
  urlDatabase[short] = long;
  res.redirect("/urls/" + short);
});

// root page which redirects to URL Listing Page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("urls.json", (req, res) => {
  res.json(urlDatabase);
});

// see an individual URL's page
// pass through the long and short URLs to the page so they
// can be used there
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
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

// if app can run, console log will print a confirmation
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
