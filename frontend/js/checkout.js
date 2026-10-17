/* =====================================================
   FOODAPP CHECKOUT
===================================================== */


let checkoutCart = [];

let checkoutRestaurantId = null;

let checkoutTotal = 0;


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname
                .endsWith("checkout.html")
        ) {

            return;

        }


        if (!getToken()) {

            window.location.href =
                "login.html";

            return;

        }


        loadCheckout();

    }
);


/* =====================================================
   LOAD CHECKOUT
===================================================== */

async function loadCheckout() {

    const container =
        document.getElementById(
            "checkoutContainer"
        );


    try {

        const data =
            await getCart();


        checkoutCart =
            data.cart ||
            data.items ||
            data;


        if (
            !Array.isArray(checkoutCart) ||
            checkoutCart.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Add some food before checkout.
                    </p>

                    <br>

                    <a
                        href="restaurants.html"
                        class="btn btn-primary"
                    >
                        Browse Restaurants
                    </a>

                </div>

            `;

            return;

        }


        checkoutRestaurantId =
            checkoutCart[0].restraunt_id ||
            checkoutCart[0].restaurant_id;


        checkoutTotal = 0;


        checkoutCart.forEach(
            function (item) {

                checkoutTotal +=
                    Number(
                        item.item_total ||
                        (
                            Number(
                                item.product_price ||
                                item.price ||
                                0
                            ) *
                            Number(
                                item.cart_quantity ||
                                item.quantity ||
                                0
                            )
                        )
                    );

            }
        );


        displayCheckout();


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    Checkout unavailable
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =====================================================
   DISPLAY CHECKOUT
===================================================== */

function displayCheckout() {

    const container =
        document.getElementById(
            "checkoutContainer"
        );


    const user =
        getUser();


    container.innerHTML = `

        <div class="checkout-layout">


            <!-- ================= LEFT ================= -->

            <div class="checkout-main">


                <!-- DELIVERY -->

                <div class="checkout-card">

                    <div class="checkout-card-header">

                        <h2>
                            📍 Delivery Address
                        </h2>

                    </div>


                    <div class="address-box">

                        <strong>

                            ${
                                user?.username ||
                                "Customer"
                            }

                        </strong>


                        <p>

                            ${
                                user?.contact ||
                                user?.contact_number ||
                                "Contact not available"
                            }

                        </p>


                        <p>

                            ${
                                user?.address ||
                                "Your registered address"
                            }

                        </p>

                    </div>


                    <p class="checkout-note">

                        Your order will be delivered
                        to your registered address.

                    </p>

                </div>



                <!-- PAYMENT -->

                <div class="checkout-card">

                    <div class="checkout-card-header">

                        <h2>
                            💳 Payment Method
                        </h2>

                    </div>


                    <div class="payment-options">


                        <!-- COD -->

                        <label class="payment-option">

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked
                            >

                            <div>

                                <strong>
                                    💵 Cash on Delivery
                                </strong>

                                <span>
                                    Pay when your food arrives.
                                </span>

                            </div>

                        </label>



                        <!-- UPI -->

                        <label class="payment-option">

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="UPI"
                            >

                            <div>

                                <strong>
                                    📱 UPI
                                </strong>

                                <span>
                                    Demo UPI payment.
                                </span>

                            </div>

                        </label>



                        <!-- CREDIT CARD -->

                        <label class="payment-option">

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit-card"
                            >

                            <div>

                                <strong>
                                    💳 Credit Card
                                </strong>

                                <span>
                                    Demo card payment.
                                </span>

                            </div>

                        </label>



                        <!-- DEBIT CARD -->

                        <label class="payment-option">

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="debit-card"
                            >

                            <div>

                                <strong>
                                    💳 Debit Card
                                </strong>

                                <span>
                                    Demo card payment.
                                </span>

                            </div>

                        </label>


                    </div>

                </div>



                <!-- ORDER ITEMS -->

                <div class="checkout-card">

                    <div class="checkout-card-header">

                        <h2>
                            🍽️ Your Items
                        </h2>

                    </div>


                    <div class="checkout-items">

                        ${
                            checkoutCart
                                .map(
                                    createCheckoutItem
                                )
                                .join("")
                        }

                    </div>

                </div>

            </div>



            <!-- ================= RIGHT ================= -->

            <aside class="checkout-summary">

                <h2>
                    Order Summary
                </h2>


                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <span>
                        ₹${checkoutTotal.toFixed(2)}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Delivery Fee
                    </span>

                    <span class="free">
                        FREE
                    </span>

                </div>


                <div class="summary-divider">
                </div>


                <div class="summary-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${checkoutTotal.toFixed(2)}
                    </strong>

                </div>


                <button
                    id="placeOrderButton"
                    class="btn btn-primary btn-full btn-large"
                    onclick="placeOrder()"
                >

                    Place Order

                </button>


                <a
                    href="cart.html"
                    class="continue-shopping"
                >

                    ← Back to Cart

                </a>


                <p class="secure-note">

                    🔒 Your order is securely processed
                    by FoodApp.

                </p>

            </aside>

        </div>

    `;

}


/* =====================================================
   CHECKOUT ITEM
===================================================== */

function createCheckoutItem(item) {

    const name =
        item.product_name ||
        "Food Item";


    const price =
        Number(
            item.product_price ||
            item.price ||
            0
        );


    const quantity =
        Number(
            item.cart_quantity ||
            item.quantity ||
            1
        );


    const total =
        Number(
            item.item_total ||
            price * quantity
        );


    const image =
        getImageUrl(
            item.product_image
        );


    return `

        <div class="checkout-item">


            <div class="checkout-item-image">

                ${
                    image

                    ? `<img
                        src="${image}"
                        alt="${name}"
                        onerror="
                            this.style.display='none';
                            this.parentElement.innerHTML='🍽️';
                        "
                    >`

                    : "🍽️"
                }

            </div>


            <div class="checkout-item-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    ₹${price.toFixed(2)}
                    ×
                    ${quantity}
                </span>

            </div>


            <strong>

                ₹${total.toFixed(2)}

            </strong>

        </div>

    `;

}


/* =====================================================
   PLACE ORDER
===================================================== */

async function placeOrder() {

    const button =
        document.getElementById(
            "placeOrderButton"
        );


    const message =
        document.getElementById(
            "checkoutMessage"
        );


    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selected) {

        showCheckoutMessage(
            "Please select a payment method.",
            "error"
        );

        return;

    }


    if (
        !checkoutRestaurantId
    ) {

        showCheckoutMessage(
            "Restaurant information is missing.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Place order for ₹${checkoutTotal.toFixed(2)}?`
        );


    if (!confirmed) {

        return;

    }


    button.disabled = true;

    button.textContent =
        "Placing Order...";


    try {

        const result =
            await createOrder(
                checkoutRestaurantId,
                selected.value
            );


        console.log(
            "Order created:",
            result
        );


        showCheckoutMessage(
            "Order placed successfully!",
            "success"
        );


        /*
           Get order ID from backend response.
        */

        const order =
            result.order ||
            result;


        const orderId =
            order.order_id ||
            result.order_id ||
            result.id;


        setTimeout(
            function () {

                if (orderId) {

                    window.location.href =
                        `order-details.html?id=${orderId}`;

                } else {

                    window.location.href =
                        "orders.html";

                }

            },
            1000
        );


    } catch (error) {

        console.error(error);


        showCheckoutMessage(
            error.message ||
            "Unable to place order.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Place Order";

    }

}


/* =====================================================
   MESSAGE
===================================================== */

function showCheckoutMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "checkoutMessage"
        );


    if (!message) {

        return;

    }


    message.className =
        `message ${type}`;


    message.textContent =
        text;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}