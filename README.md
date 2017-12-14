## Membership Sign Up App for VegFest!
### https://member.vegfest.org

This is the web app where people can sign up to become monthly supporters of VegFest

**How does it work?** A user signs up for a monthly membership on the webpage and this app sends the data over to Stripe to become a monthly subscription.

## Tech tools

* **Javascript/Node/Express/Handlebars** - tech stack for this app
* **Stripe API** - payment processing


## Future improvements

Generally my vision for this project is for it to become a backend for various VegFest services, eg a backend for signature gathering on petitions and a backend for email list signups. This will be a service that routes data to the right places when it comes in. Eg when someone signs up for a membership, the data goes to Stripe for payment processing but also it gets sent over to MailChimp so the member gets added to the appropriate list and also it triggers a transactional email thanking them for becoming a member.

You can check out the [issues tab](https://github.com/VegFest/membership-signup/issues) of this github project to see what's coming up
for improvements. You can also add new issues there too.
