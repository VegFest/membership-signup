
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const port = process.env.PORT || 8080;

const express = require("express");
const app = express();
const stripe = require("stripe")(keySecret);
const path = require('path');
const cors = require('cors');

function getStats (cb) {
  stripe.subscriptions.list(
    { limit: 99 },
    function(err, subscriptions) {
    // asynchronously called

    var stats = {
      monthly06 : 0,
      monthly10 : 0,
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
      if (subscriptions.data[i].plan.id == 'plan_EcdyYnI6uTihEv') {
        stats.monthly10++;
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
    stats.totalMonthlyAmt = (stats.monthly06 * 6) + (stats.monthly10 * 10) + (stats.monthly14 * 14) + (stats.monthly25 * 25) + (stats.monthly50 * 50);
    stats.totalMembers = stats.monthly06 + stats.monthly10 + stats.monthly14 + stats.monthly25 + stats.monthly50;
    cb(stats);
  });
};

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
  res.render("3reasons.hbs", {keyPublishable}));

//3 reasons to become a member view set up with publishable key
app.get("/3reasons", (req, res) =>
  res.render("3reasons.hbs", {keyPublishable}));


//this route is for post-checkout confirmation & actually signs ppl up
app.post("/subscribe", (req, res) => {
  console.log('New Member! Here is what was just submitted:');
  console.log(req.body);
  var memberSrc = 'unknown';

  if (typeof req.body.src !== 'undefined' && req.body.src !== null && req.body.src != '') {
    memberSrc = req.body.src;
  }
  console.log('memberSrc: ', memberSrc);

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

  getStats(function (data) {
    res.send(data);
    console.log('memberdata ',data);
  });
});//statsapi


app.get("/statsforslack", (req, res) => {

  getStats(function (data) {
    var sentence = '---\n';
    sentence += 'There are a total of *' + data.totalMembers + ' members*.\n';
    sentence += 'Which fundraises *$' + data.totalMonthlyAmt + '/mo*. \n';
    sentence += 'Estimated annual fundraising: *$' + data.totalMonthlyAmt*12 + '* (if everyone is a member for a year). \n';
    sentence += '---\n';
    sentence += '*' + data.monthly06 + '* members @ $6/mo. \n';
    sentence += '*' + data.monthly10 + '* members @ $10/mo. \n';
    sentence += '*' + data.monthly14 + '* members @ $14/mo. \n';
    sentence += '*' + data.monthly25 + '* members @ $25/mo. \n';
    sentence += '*' + data.monthly50 + '* members @ $50/mo. \n';

    res.send(sentence);
    console.log('sentence ',sentence);
  });
});//statsapi

// a page with stats about membership
app.get("/stats", (req, res) => {
  getStats(function (data) {
    res.render("stats.hbs", data);
  })

});//stats



//custom 404 page
app.get('*', function(req, res){
  res.render("404.hbs");
});








app.listen(port);
