$(document).ready(function () {
  var checkout = StripeCheckout.configure({
    key: "{{keyPublishable}}",
    image: "//vegfest.org/assets/images/vegetables.png",
    name: "VegFest Membership",
    panelLabel: "Become a member",
    billingAddress: true,
    zipCode: true,
    shippingAddress: true,
    allowRememberMe: false,
    description: "$6/month",
    amount:"600"
  });

  $('#membership-individual').click( function(e) {
    checkout.open();
    e.preventDefault();
  });

  $('#membership-family').click( function(e) {
    var checkout = StripeCheckout.configure({
      key: "{{keyPublishable}}",
      image: "//vegfest.org/assets/images/vegetables.png",
      name: "VegFest Membership",
      panelLabel: "Become a member",
      billingAddress: true,
      zipCode: true,
      shippingAddress: true,
      allowRememberMe: false,
      description: "$14/month",
      amount:"1400"
    });

    checkout.open();
    e.preventDefault();
  });

})
