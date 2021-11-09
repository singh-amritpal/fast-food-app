const Order = require("./assignment2Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  ONIONRINGS: Symbol("onionrings"),
  NUGGETS: Symbol("nuggets"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment")
});

module.exports = class PoutineOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sToppings = "";
    this.sOnionRings = "";
    this.sNuggets = "";
    this.sDrinks = "";
    this.sItem = "poutine";
  }
  handleInput(sInput) {
    let aReturn = [];
    let total = 0;

    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE;
        aReturn.push("Welcome to Amrit's Poutine.");
        aReturn.push("What size Poutine would you like?");
        break;
      case OrderState.SIZE:
        if (sInput.toLowerCase() != "small" && sInput.toLowerCase() != "medium" && sInput.toLowerCase() != "large") {
          aReturn.push("Please enter either small, medium or large.");
        }
        else {
          this.stateCur = OrderState.TOPPINGS;
          this.sSize = sInput;
          aReturn.push("What toppings would you like?");
        }
        break;
      case OrderState.TOPPINGS:
        if (sInput.toLowerCase() != "bacon" && sInput.toLowerCase() != "grated cheese" && sInput.toLowerCase() != "fries") {
          aReturn.push("Please enter either bacon, grated cheese or fries.");
        }
        else {
          this.stateCur = OrderState.ONIONRINGS;
          this.sToppings = sInput;
          aReturn.push("Would you like to add Onion Rings with that?");
        }
        break;
      case OrderState.ONIONRINGS:
        if (sInput.toLowerCase() != "no" && sInput.toLowerCase() != "yes") {
          aReturn.push("Please enter either yes or no.");
        } else {
          this.stateCur = OrderState.NUGGETS;
          if (sInput.toLowerCase() != "no") {
            this.sOnionRings = sInput;
          }
          aReturn.push("Would you like Chicken Nuggets with that?");
        }
        break;
      case OrderState.NUGGETS:
        if (sInput.toLowerCase() != "no" && sInput.toLowerCase() != "yes") {
          aReturn.push("Please enter either yes or no.");
        } else {
          this.stateCur = OrderState.DRINKS;
          if (sInput.toLowerCase() != "no") {
            this.sNuggets = sInput;
          }
          aReturn.push("Would you like Drinks with that?");
        }
        break;
      case OrderState.DRINKS:
        if (sInput.toLowerCase() != "no" && sInput.toLowerCase() != "yes") {
          aReturn.push("Please enter either yes or no.");
        } else {
          this.stateCur = OrderState.PAYMENT;
          this.nOrder = 15;
          if (sInput.toLowerCase() != "no") {
            this.sDrinks = sInput;
          }
          aReturn.push("Thank-you for your order of");
          aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}: $7.99`);
          total += 7.99;
          if (this.sOnionRings) {
            total += 5.99;
            aReturn.push('Onion Rings: $5.99');
          }
          if (this.sNuggets) {
            total += 4.99;
            aReturn.push('Chicken Nuggets: $4.99');
          }
          if (this.sDrinks) {
            total += 1.40;
            aReturn.push('Drinks: $1.49');
          }
          let tax = total * 0.13;
          total += tax;
          this.nOrder = total;
          aReturn.push(`Your Final Total will be : $${this.nOrder.toFixed(2)}`);
          aReturn.push(`Please pay for your order here`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        }
        break;
      case OrderState.PAYMENT:
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered by ${d.toTimeString()}`);
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder.toFixed(2)}.
        <div id="paypal-button-container"></div>
        <script src="/js/store.js" type="module"></script>
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder.toFixed(2)}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    details.order = ${JSON.stringify(this)};
                    window.StoreData(details);
                  });
                });
              }
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      </body>          
      `);
  }
}