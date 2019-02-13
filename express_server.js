var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

// Add the code below
// to the top of the express_server.js file.
// After we've declared app, as shown below.
// This tells the Express app to use EJS as its
// templating engine.
app.set("view engine", "ejs");

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
