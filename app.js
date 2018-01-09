
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const port = process.env.PORT;

const express = require("express");
const app = express();
const stripe = require("stripe")(keySecret);
const path = require('path');
const cors = require('cors');

app.use(cors());

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
  var memberSrc = 'unknown';

  if (typeof req.body.src !== 'undefined' && req.body.src !== null && req.body.src != '') {
    memberSrc = req.body.src;
  }

  stripe.customers.create({
     email: req.body.stripeEmail,
     source: req.body.stripeToken,
     metadata: {
       memberStartDate: new Date(),
       memberPlan: req.body.subscriptionPlan,
       memberEmail: req.body.stripeEmail,
       memberSrc: memberSrc, //add this later in the frontend, it should come from GET param ?src=XXXX
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

// a json api with stats about membership
//maybe make this a POST instead of a GET later
app.get("/statsapi", (req, res) => {

  stripe.subscriptions.list(
    { limit: 99 },
    function(err, subscriptions) {
    // asynchronously called

    var stats = {
      monthly06 : 0,
      monthly14: 0,
      monthly25: 0,
      monthly50: 0,
      totalMonthlyAmt: 0,
      totalMembers: 0
    }
    for (var i = 0; i < subscriptions.data.length; i++) {

      if (subscriptions.data[i].plan.id == 'membership-06') {
        stats.monthly06++;
      }
      if (subscriptions.data[i].plan.id == 'membership-14') {
        stats.monthly14++;
      }
      if (subscriptions.data[i].plan.id == 'membership-25') {
        stats.monthly25++;
      }
      if (subscriptions.data[i].plan.id == 'membership-50') {
        stats.monthly50++;
      }
    }
    stats.totalMonthlyAmt = (stats.monthly06 * 6) + (stats.monthly14 * 14) + (stats.monthly25 * 25) + (stats.monthly50 * 50);
    stats.totalMembers = stats.monthly06 + stats.monthly14 + stats.monthly25 + stats.monthly50;

    res.send(stats);
    console.log('response=',stats);
  });

});//statsapi

// a page with stats about membership
app.get("/stats", (req, res) => {

  stripe.subscriptions.list(
    { limit: 99 },
    function(err, subscriptions) {
    // asynchronously called

    var stats = {
      monthly06 : 0,
      monthly14: 0,
      monthly25: 0,
      monthly50: 0,
      totalMonthlyAmt: 0,
      totalMembers: 0
    }
      for (var i = 0; i < subscriptions.data.length; i++) {

        if (subscriptions.data[i].plan.id == 'membership-06') {
          stats.monthly06++;
        }
        if (subscriptions.data[i].plan.id == 'membership-14') {
          stats.monthly14++;
        }
        if (subscriptions.data[i].plan.id == 'membership-25') {
          stats.monthly25++;
        }
        if (subscriptions.data[i].plan.id == 'membership-50') {
          stats.monthly50++;
        }
      }
      stats.totalMonthlyAmt = (stats.monthly06 * 6) + (stats.monthly14 * 14) + (stats.monthly25 * 25) + (stats.monthly50 * 50);
      stats.totalMembers = stats.monthly06 + stats.monthly14 + stats.monthly25 + stats.monthly50;
      res.render("stats.hbs", stats);
  });

});//stats



//custom 404 page
app.get('*', function(req, res){
  res.render("404.hbs");
});








app.listen(port);
