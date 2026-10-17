/* =====================================================
   RESTAURANT DETAILS + MENU
===================================================== */


let restaurantProducts = [];


let restaurantId =
    new URLSearchParams(
        window.location.search
    ).get("id");


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname
                .endsWith("restaurant.html")
        ) {

            return;

        }


        if (!restaurantId) {

            showRestaurantError(
                "Restaurant ID is missing."
            );

            return;

        }


        loadRestaurant();

        setupMenuSearch();

    }
);


/* =====================================================
   LOAD RESTAURANT
===================================================== */

async function loadRestaurant() {

    const details =
        document.getElementById(
            "restaurantDetails"
        );


    try {

        const data =
            await getRestaurant(
                restaurantId
            );


        const restaurant =
            data.restaurant ||
            data;


        if (!restaurant) {

            throw new Error(
                "Restaurant not found."
            );

        }


        displayRestaurant(
            restaurant
        );


        await loadRestaurantProducts();


    } catch (error) {

        console.error(error);

        showRestaurantError(
            error.message ||
            "Unable to load restaurant."
        );

    }

}


/* =====================================================
   RESTAURANT DETAILS
===================================================== */

function displayRestaurant(
    restaurant
) {

    const container =
        document.getElementById(
            "restaurantDetails"
        );


    const image =
        getImageUrl(
            restaurant.image
        );


    const isOpen =
        restaurant.is_open === "yes" ||
        restaurant.is_open === true ||
        restaurant.is_open === 1;


    container.innerHTML = `

        <div class="restaurant-large-image">

            ${
                image

                ? `<img
                    src="${image}"
                    alt="${restaurant.restraunt_name}"
                    onerror="
                        this.style.display='none';
                        this.parentElement.innerHTML='🍽️';
                    "
                >`

                : "🍽️"
            }

        </div>


        <div class="restaurant-hero-info">

            <span class="
                restaurant-status
                ${
                    isOpen
                    ? "status-open"
                    : "status-closed"
                }
            ">

                ${
                    isOpen
                    ? "🟢 Open Now"
                    : "🔴 Closed"
                }

            </span>


            <h1>

                ${
                    restaurant.restraunt_name ||
                    "Restaurant"
                }

            </h1>


            <p>

                📍
                ${
                    restaurant.address ||
                    "Address unavailable"
                }

            </p>


            <p>

                📞
                ${
                    restaurant.contact_num ||
                    "Contact unavailable"
                }

            </p>


            <div class="restaurant-meta">

                <span class="meta-item">

                    🕐
                    ${
                        formatTime(
                            restaurant.opening_time
                        )
                    }

                    -

                    ${
                        formatTime(
                            restaurant.closing_time
                        )
                    }

                </span>


                <span class="meta-item">

                    🍽️ Food & Drinks

                </span>

            </div>

        </div>

    `;

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadRestaurantProducts() {

    const container =
        document.getElementById(
            "menuContainer"
        );


    try {

        const data =
            await getProducts();


        const products =
            data.products ||
            data;


        restaurantProducts =
            products.filter(
                function (product) {

                    return String(
                        product.restraunt_id
                    ) === String(
                        restaurantId
                    );

                }
            );


        displayMenu(
            restaurantProducts
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                Unable to load menu.

            </div>

        `;

    }

}


/* =====================================================
   DISPLAY MENU
===================================================== */

function displayMenu(products) {

    const container =
        document.getElementById(
            "menuContainer"
        );


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No food available
                </h3>

                <p>
                    This restaurant hasn't
                    added any food yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        products
            .map(
                function (product) {

                    return createMenuProductCard(
                        product
                    );

                }
            )
            .join("");

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createMenuProductCard(
    product
) {

    const image =
        getImageUrl(
            product.product_image
        );


    const rating =
        product.product_rating ||
        0;


    return `

        <div class="product-card">


            <a href="
                product.html?id=${product.product_id}
            ">

                <div class="product-image">

                    ${
                        image

                        ? `<img
                            src="${image}"
                            alt="${product.product_name}"
                            onerror="
                                this.style.display='none';
                                this.parentElement.innerHTML='🍽️';
                            "
                        >`

                        : "🍽️"
                    }

                </div>

            </a>


            <div class="product-info">


                <a href="
                    product.html?id=${product.product_id}
                ">

                    <h3>
                        ${product.product_name}
                    </h3>

                </a>


                <p class="product-description">

                    ${
                        product.product_descript ||
                        "Delicious food"
                    }

                </p>


                <div class="rating">

                    ⭐ ${rating}

                </div>


                <div class="product-bottom">

                    <span class="product-price">

                        ₹${product.product_price}

                    </span>


                    <button
                        class="btn btn-primary"
                        onclick="
                            handleRestaurantAddToCart(
                                ${product.product_id}
                            )
                        "
                    >

                        Add

                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =====================================================
   ADD TO CART
===================================================== */

async function handleRestaurantAddToCart(
    productId
) {

    if (!getToken()) {

        alert(
            "Please login to add items to cart."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        await addToCart(
            productId,
            1
        );


        alert(
            "Food added to cart!"
        );


        updateCartCount();


    } catch (error) {

        alert(
            error.message ||
            "Unable to add item."
        );

    }

}


/* =====================================================
   SEARCH MENU
===================================================== */

function setupMenuSearch() {

    const search =
        document.getElementById(
            "menuSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            const text =
                search.value
                    .trim()
                    .toLowerCase();


            const filtered =
                restaurantProducts.filter(
                    function (product) {

                        return (
                            (
                                product.product_name ||
                                ""
                            )
                            .toLowerCase()
                            .includes(text)
                        );

                    }
                );


            displayMenu(
                filtered
            );

        }
    );

}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(value) {

    if (!value) {

        return "--:--";

    }


    try {

        const date =
            new Date(value);


        if (isNaN(date.getTime())) {

            return String(value)
                .substring(0, 5);

        }


        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return String(value);

    }

}


/* =====================================================
   ERROR
===================================================== */

function showRestaurantError(
    message
) {

    const details =
        document.getElementById(
            "restaurantDetails"
        );


    if (details) {

        details.innerHTML = `

            <div class="empty-state">

                <h2>
                    Restaurant unavailable
                </h2>

                <p>
                    ${message}
                </p>

                <br>

                <a
                    href="restaurants.html"
                    class="btn btn-primary"
                >
                    Back to Restaurants
                </a>

            </div>

        `;

    }

}