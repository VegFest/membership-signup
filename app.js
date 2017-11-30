const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const port = process.env.PORT;

const express = require("express");
const app = express();
const stripe = require("stripe")(keySecret);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public'))); //  "public" off of current is root



//handlebars templating system
var hbs = require('express-hbs');
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

//this is so we can accept POST requests
app.use(require("body-parser").urlencoded({extended: false}));


//main route & view set up with publishable key
app.get("/", (req, res) =>
  res.render("index.hbs", {keyPublishable}));

//this route is for post-checkout confirmation
app.post("/confirm", (req, res) => {
  // let amount = 500;
  // let amount = req.body.stripeAmount;


  stripe.customers.create({
     email: req.body.stripeEmail,
     source: req.body.stripeToken
  })
  .then(customer =>
    stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: req.body.subscriptionPlan,
        },
      ],
    }))

  .then(subscription => res.render("charge.hbs", {subscription}));
});




app.listen(port);
