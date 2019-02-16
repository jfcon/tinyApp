# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

The tinyApp will take any URL you submit, and give you a shorter hyperlink for it!
No matter how long, it will reduce it to a six-character string.
After registration with the site, anyone can save some space on URLs.

!["The Main URL Page: See your URLs here. No one else but the logged in user has access to this page, or their specific shortened URLs."](https://github.com/new-dart/tinyApp/blob/master/docs/urls-page.png?raw=true)

The lists are private and can only be seen by the User.
The shortened links themselves can be accessed by anyone, regardless of
whether or not they are registered on the site.

!["The Edit Page: Clicking on the link will send you to the URL via the shortened link. Altering your url will not change it's tinyID.](https://github.com/new-dart/tinyApp/blob/master/docs/edit-page.png?raw=true)

The User can delete and edit the route of the link if they want.

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Type `npm start` to start a consantly running server. Doing so will refresh the server each time you make changes to express_server.js
