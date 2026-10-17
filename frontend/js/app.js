/* =====================================================
   FOODAPP MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateNavbar();

        updateCartCount();

        initializePage();

    }
);


/* =====================================================
   PAGE DETECTION
===================================================== */

function initializePage() {

    const page =
        window.location.pathname
            .split("/")
            .pop();


    if (
        page === "" ||
        page === "index.html"
    ) {

        loadHomePage();

    }


    if (page === "login.html") {

        initializeLogin();

    }


    if (page === "register.html") {

        initializeRegister();

    }

}


/* =====================================================
   NAVBAR
===================================================== */

function updateNavbar() {

    const navAuth =
        document.getElementById("navAuth");


    if (!navAuth) {

        return;

    }


    const user = getUser();


    if (!user) {

        navAuth.innerHTML = `

            <a href="login.html"
               class="btn btn-outline">
                Login
            </a>

            <a href="register.html"
               class="btn btn-primary">
                Register
            </a>

        `;

        return;

    }


    navAuth.innerHTML = `

        <a href="profile.html"
           class="btn btn-outline">
            👤 ${user.username || "Profile"}
        </a>

        <button
            onclick="logout()"
            class="btn btn-primary">
            Logout
        </button>

    `;

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    removeToken();

    removeUser();

    window.location.href =
        "index.html";

}


/* =====================================================
   CART COUNT
===================================================== */

async function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");


    if (!cartCount) {

        return;

    }


    if (!getToken()) {

        cartCount.textContent = "0";

        return;

    }


    try {

        const data =
            await getCart();


        const cart =
            data.cart ||
            data.items ||
            data;


        if (Array.isArray(cart)) {

            cartCount.textContent =
                cart.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.cart_quantity ||
                            item.quantity ||
                            0
                        ),
                    0
                );

        } else {

            cartCount.textContent = "0";

        }


    } catch (error) {

        cartCount.textContent = "0";

    }

}


/* =====================================================
   HOME PAGE
===================================================== */

async function loadHomePage() {

    loadCategories();

    loadRestaurants();

    loadProducts();

}


/* =====================================================
   CATEGORIES
===================================================== */

async function loadCategories() {

    const container =
        document.getElementById(
            "categoriesContainer"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await getCategories();


        const categories =
            data.categories ||
            data;


        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">
                    No categories available.
                </div>

            `;

            return;

        }


        const icons = [
            "🍕",
            "🍔",
            "🍜",
            "🍗",
            "🥗",
            "🍰",
            "🌮",
            "🍟",
            "🍛",
            "🥪"
        ];


        container.innerHTML =
            categories
                .slice(0, 10)
                .map(
                    (category, index) => {

                        return `

                            <div
                                class="category-card"
                                onclick="openCategory(
                                    ${category.category_id}
                                )">

                                <div class="category-icon">
                                    ${icons[index % icons.length]}
                                </div>

                                <h3>
                                    ${
                                        category.category_name
                                    }
                                </h3>

                            </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        container.innerHTML = `

            <div class="empty-state">

                Unable to load categories.

                <br>

                <small>
                    Make sure your backend is running.
                </small>

            </div>

        `;

    }

}


/* =====================================================
   CATEGORY CLICK
===================================================== */

function openCategory(categoryId) {

    window.location.href =
        `restaurants.html?category=${categoryId}`;

}


/* =====================================================
   RESTAURANTS
===================================================== */

async function loadRestaurants() {

    const container =
        document.getElementById(
            "restaurantsContainer"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await getRestaurants();


        const restaurants =
            data.restaurants ||
            data;


        if (
            !Array.isArray(restaurants) ||
            restaurants.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No restaurants available.

                </div>

            `;

            return;

        }


        container.innerHTML =
            restaurants
                .slice(0, 6)
                .map(
                    restaurant =>
                        createRestaurantCard(
                            restaurant
                        )
                )
                .join("");


    } catch (error) {

        container.innerHTML = `

            <div class="empty-state">

                Unable to load restaurants.

            </div>

        `;

    }

}


/* =====================================================
   RESTAURANT CARD
===================================================== */

function createRestaurantCard(restaurant) {

    const id =
        restaurant.restraunt_id;


    const name =
        restaurant.restraunt_name ||
        "Restaurant";


    const address =
        restaurant.address ||
        "Address unavailable";


    const isOpen =
        restaurant.is_open === "yes" ||
        restaurant.is_open === true ||
        restaurant.is_open === 1;


    const image =
        getImageUrl(
            restaurant.image
        );


    return `

        <div class="restaurant-card">

            <div class="restaurant-image">

                ${
                    image

                    ? `<img
                        src="${image}"
                        alt="${name}"
                        onerror="this.style.display='none';
                        this.parentElement.innerHTML='🍽️';"
                    >`

                    : "🍽️"
                }

            </div>


            <div class="restaurant-info">

                <h3>
                    ${name}
                </h3>

                <p class="restaurant-address">
                    📍 ${address}
                </p>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                ">

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
                            ? "Open"
                            : "Closed"
                        }

                    </span>


                    <a
                        href="restaurant.html?id=${id}"
                        class="btn btn-primary"
                    >
                        View Menu
                    </a>

                </div>

            </div>

        </div>

    `;

}


/* =====================================================
   PRODUCTS
===================================================== */

async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await getProducts();


        const products =
            data.products ||
            data;


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No food available.

                </div>

            `;

            return;

        }


        container.innerHTML =
            products
                .slice(0, 8)
                .map(
                    product =>
                        createProductCard(
                            product
                        )
                )
                .join("");


    } catch (error) {

        container.innerHTML = `

            <div class="empty-state">

                Unable to load food.

            </div>

        `;

    }

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const image =
        getImageUrl(
            product.product_image
        );


    const rating =
        product.product_rating ||
        0;


    return `

        <div class="product-card">

            <div class="product-image">

                ${
                    image

                    ? `<img
                        src="${image}"
                        alt="${product.product_name}"
                        onerror="this.style.display='none';
                        this.parentElement.innerHTML='🍽️';"
                    >`

                    : "🍽️"
                }

            </div>


            <div class="product-info">

                <h3>
                    ${product.product_name}
                </h3>


                <p class="product-description">

                    ${
                        product.product_descript ||
                        "Delicious food item"
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
                        onclick="handleAddToCart(
                            ${product.product_id}
                        )"
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

async function handleAddToCart(productId) {

    if (!getToken()) {

        alert(
            "Please login before adding items to cart."
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
            "Item added to cart!"
        );


        updateCartCount();


    } catch (error) {

        alert(
            error.message ||
            "Unable to add item to cart."
        );

    }

}


/* =====================================================
   LOGIN
===================================================== */

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const button =
                document.getElementById(
                    "loginButton"
                );


            const message =
                document.getElementById(
                    "loginMessage"
                );


            button.disabled = true;

            button.textContent =
                "Logging in...";


            try {

                const data =
                    await loginUser(
                        email,
                        password
                    );


                /*
                   Backend may return:

                   {
                       token: "...",
                       user: {...}
                   }

                   or token/user under another object.
                */

                const token =
                    data.token ||
                    data.accessToken;


                const user =
                    data.user ||
                    data.profile;


                if (!token) {

                    throw new Error(
                        "Login successful but token was not returned."
                    );

                }


                saveToken(token);


                if (user) {

                    saveUser(user);

                }


                message.className =
                    "message success";


                message.textContent =
                    "Login successful! Redirecting...";


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    800
                );


            } catch (error) {

                message.className =
                    "message error";


                message.textContent =
                    error.message ||
                    "Login failed.";

            }


            button.disabled = false;

            button.textContent =
                "Login";

        }
    );

}


/* =====================================================
   REGISTER
===================================================== */

function initializeRegister() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const contact =
                document.getElementById(
                    "contact"
                ).value.trim();


            const address =
                document.getElementById(
                    "address"
                ).value.trim();


            const button =
                document.getElementById(
                    "registerButton"
                );


            const message =
                document.getElementById(
                    "registerMessage"
                );


            button.disabled = true;

            button.textContent =
                "Creating Account...";


            try {

                const data =
                    await registerUser({

                        username: username,

                        email: email,

                        password: password,

                        contact: contact,

                        address: address,

                        role: "user"

                    });


                const token =
                    data.token ||
                    data.accessToken;


                const user =
                    data.user ||
                    data.profile;


                if (token) {

                    saveToken(token);

                }


                if (user) {

                    saveUser(user);

                }


                message.className =
                    "message success";


                message.textContent =
                    "Account created successfully!";


                setTimeout(
                    function () {

                        window.location.href =
                            token
                            ? "index.html"
                            : "login.html";

                    },
                    900
                );


            } catch (error) {

                message.className =
                    "message error";


                message.textContent =
                    error.message ||
                    "Registration failed.";

            }


            button.disabled = false;

            button.textContent =
                "Create Account";

        }
    );

}