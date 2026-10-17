/* =====================================================
   FOODAPP CART
===================================================== */


let cartItems = [];

let cartRestaurantId = null;


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname
                .endsWith("cart.html")
        ) {

            return;

        }


        if (!getToken()) {

            showLoginMessage();

            return;

        }


        loadCart();

    }
);


/* =====================================================
   LOAD CART
===================================================== */

async function loadCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    try {

        const data =
            await getCart();


        cartItems =
            data.cart ||
            data.items ||
            data;


        if (
            !Array.isArray(cartItems) ||
            cartItems.length === 0
        ) {

            displayEmptyCart();

            updateCartCount();

            return;

        }


        /*
           Determine restaurant.

           FoodApp allows one restaurant
           per order.
        */

        cartRestaurantId =
            cartItems[0].restraunt_id ||
            cartItems[0].restaurant_id ||
            null;


        displayCart();

        updateCartCount();


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    Unable to load cart
                </h2>

                <p>
                    ${error.message}
                </p>

                <br>

                <a
                    href="restaurants.html"
                    class="btn btn-primary"
                >
                    Browse Food
                </a>

            </div>

        `;

    }

}


/* =====================================================
   DISPLAY CART
===================================================== */

function displayCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    let total = 0;


    cartItems.forEach(
        function (item) {

            total +=
                Number(
                    item.item_total ||
                    (
                        Number(
                            item.product_price ||
                            item.price_at_order ||
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


    container.innerHTML = `

        <div class="cart-layout">


            <!-- ================= ITEMS ================= -->

            <div class="cart-items">


                <div class="cart-section-title">

                    <h2>
                        Cart Items
                    </h2>

                    <span>
                        ${cartItems.length}
                        item(s)
                    </span>

                </div>


                ${

                    cartItems
                        .map(
                            function (item) {

                                return createCartItem(
                                    item
                                );

                            }
                        )
                        .join("")

                }

            </div>



            <!-- ================= SUMMARY ================= -->

            <aside class="cart-summary">

                <h2>
                    Order Summary
                </h2>


                <div class="summary-row">

                    <span>
                        Items
                    </span>

                    <span>
                        ${cartItems.length}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <span>
                        ₹${total.toFixed(2)}
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
                        ₹${total.toFixed(2)}
                    </strong>

                </div>


                <button
                    class="btn btn-primary btn-full"
                    onclick="goToCheckout()"
                >

                    Proceed to Checkout →

                </button>


                <a
                    href="restaurants.html"
                    class="continue-shopping"
                >

                    ← Continue Shopping

                </a>

            </aside>

        </div>

    `;

}


/* =====================================================
   CART ITEM
===================================================== */

function createCartItem(item) {

    const cartId =
        item.cart_id;


    const productId =
        item.product_id;


    const productName =
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


    const itemTotal =
        Number(
            item.item_total ||
            price * quantity
        );


    const image =
        getImageUrl(
            item.product_image
        );


    return `

        <div class="cart-item">


            <!-- IMAGE -->

            <div class="cart-item-image">

                ${
                    image

                    ? `<img
                        src="${image}"
                        alt="${productName}"
                        onerror="
                            this.style.display='none';
                            this.parentElement.innerHTML='🍽️';
                        "
                    >`

                    : "🍽️"
                }

            </div>


            <!-- DETAILS -->

            <div class="cart-item-details">

                <a
                    href="product.html?id=${productId}"
                    class="cart-product-name"
                >

                    ${productName}

                </a>


                ${
                    item.restraunt_name

                    ? `

                        <p class="cart-restaurant">

                            🍽️
                            ${item.restraunt_name}

                        </p>

                    `

                    : ""
                }


                <p class="cart-price">

                    ₹${price.toFixed(2)}
                    / item

                </p>


                <!-- QUANTITY -->

                <div class="cart-quantity">

                    <button
                        onclick="
                            changeCartQuantity(
                                ${cartId},
                                ${quantity - 1}
                            )
                        "
                    >
                        −
                    </button>


                    <span>
                        ${quantity}
                    </span>


                    <button
                        onclick="
                            changeCartQuantity(
                                ${cartId},
                                ${quantity + 1}
                            )
                        "
                    >
                        +
                    </button>

                </div>

            </div>


            <!-- TOTAL -->

            <div class="cart-item-right">

                <strong>

                    ₹${itemTotal.toFixed(2)}

                </strong>


                <button
                    class="remove-btn"
                    onclick="
                        removeCartItemFromPage(
                            ${cartId}
                        )
                    "
                >

                    Remove

                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   CHANGE QUANTITY
===================================================== */

async function changeCartQuantity(
    cartId,
    quantity
) {

    if (quantity < 1) {

        await removeCartItemFromPage(
            cartId
        );

        return;

    }


    if (quantity > 20) {

        alert(
            "Maximum quantity is 20."
        );

        return;

    }


    try {

        await updateCartItem(
            cartId,
            quantity
        );


        await loadCart();


    } catch (error) {

        alert(
            error.message ||
            "Unable to update quantity."
        );

    }

}


/* =====================================================
   REMOVE ITEM
===================================================== */

async function removeCartItemFromPage(
    cartId
) {

    const confirmed =
        confirm(
            "Remove this item from your cart?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await removeCartItem(
            cartId
        );


        await loadCart();


    } catch (error) {

        alert(
            error.message ||
            "Unable to remove item."
        );

    }

}


/* =====================================================
   EMPTY CART
===================================================== */

function displayEmptyCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    container.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                🛒
            </div>

            <h2>
                Your cart is empty
            </h2>

            <p>
                Looks like you haven't
                added anything yet.
            </p>


            <a
                href="restaurants.html"
                class="btn btn-primary btn-large"
            >

                Explore Food

            </a>

        </div>

    `;

}


/* =====================================================
   CHECKOUT
===================================================== */

function goToCheckout() {

    if (
        !cartItems ||
        cartItems.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    window.location.href =
        "checkout.html";

}


/* =====================================================
   LOGIN MESSAGE
===================================================== */

function showLoginMessage() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    container.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                🔐
            </div>

            <h2>
                Please Login
            </h2>

            <p>
                You need to login to view your cart.
            </p>


            <a
                href="login.html"
                class="btn btn-primary btn-large"
            >

                Login

            </a>

        </div>

    `;

}