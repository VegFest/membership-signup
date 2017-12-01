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

//this route is for post-checkout confirmation & actually signs ppl up
app.post("/subscribe", (req, res) => {
  console.log('New Member! Here is what was just submitted:');
  console.log(req.body);

  stripe.customers.create({
     email: req.body.stripeEmail,
     source: req.body.stripeToken,
     metadata: {
       memberStartDate: new Date(),
       memberPlan: req.body.subscriptionPlan,
       memberEmail: req.body.stripeEmail,
       //memberSrc: req.body.src, //add this later in the frontend, it should come from GET param ?src=XXXX
       shippingName:req.body.stripeShippingName,
       shippingAddressLine1:req.body.stripeShippingAddressLine1,
       shippingAddressZip:req.body.stripeShippingAddressZip,
       shippingAddressState:req.body.stripeShippingAddressState,
       shippingAddressCity:req.body.stripeShippingAddressCity,
       shippingAddressCountry:req.body.stripeShippingAddressCountry,
       shippingAddressCountryCode:req.body.stripeShippingAddressCountryCode
     }
  })
  .then(customer =>
    stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: req.body.subscriptionPlan
        },
      ],
    }))

  .then(subscription => res.render("subscribe.hbs", {subscription}));
});




app.listen(port);
