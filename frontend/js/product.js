/* =====================================================
   PRODUCT DETAILS + REVIEWS
===================================================== */


let currentProduct = null;

let productId =
    new URLSearchParams(
        window.location.search
    ).get("id");

let selectedQuantity = 1;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname
                .endsWith("product.html")
        ) {

            return;

        }


        if (!productId) {

            showProductError(
                "Product ID is missing."
            );

            return;

        }


        loadProduct();

        setupReviewForm();

    }
);


/* =====================================================
   LOAD PRODUCT
===================================================== */

async function loadProduct() {

    const container =
        document.getElementById(
            "productContainer"
        );


    try {

        const data =
            await getProduct(
                productId
            );


        currentProduct =
            data.product ||
            data;


        if (!currentProduct) {

            throw new Error(
                "Product not found."
            );

        }


        displayProduct(
            currentProduct
        );


        loadReviews();


    } catch (error) {

        console.error(error);


        showProductError(
            error.message ||
            "Unable to load product."
        );

    }

}


/* =====================================================
   DISPLAY PRODUCT
===================================================== */

function displayProduct(
    product
) {

    const container =
        document.getElementById(
            "productContainer"
        );


    const image =
        getImageUrl(
            product.product_image
        );


    const rating =
        product.product_rating ||
        0;


    container.innerHTML = `

        <div class="product-detail">


            <div class="product-detail-image">

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


            <div class="product-detail-info">


                <span class="section-label">

                    ${
                        product.category_name ||
                        "FOOD"
                    }

                </span>


                <h1>

                    ${product.product_name}

                </h1>


                <div class="product-rating-large">

                    ⭐ ${rating}

                </div>


                <p class="product-detail-description">

                    ${
                        product.product_descript ||
                        "No description available."
                    }

                </p>


                <div class="product-detail-price">

                    ₹${product.product_price}

                </div>


                ${
                    product.restraunt_name

                    ? `

                        <p>

                            🍽️
                            <strong>
                                ${product.restraunt_name}
                            </strong>

                        </p>

                    `

                    : ""
                }


                <!-- QUANTITY -->

                <div class="quantity-control">

                    <button
                        onclick="changeQuantity(-1)"
                    >
                        −
                    </button>


                    <span id="quantity">
                        1
                    </span>


                    <button
                        onclick="changeQuantity(1)"
                    >
                        +
                    </button>

                </div>


                <button
                    class="btn btn-primary btn-large"
                    onclick="addCurrentProductToCart()"
                >

                    🛒 Add to Cart

                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   QUANTITY
===================================================== */

function changeQuantity(
    amount
) {

    selectedQuantity += amount;


    if (selectedQuantity < 1) {

        selectedQuantity = 1;

    }


    if (selectedQuantity > 20) {

        selectedQuantity = 20;

    }


    const quantity =
        document.getElementById(
            "quantity"
        );


    if (quantity) {

        quantity.textContent =
            selectedQuantity;

    }

}


/* =====================================================
   ADD CURRENT PRODUCT
===================================================== */

async function addCurrentProductToCart() {

    if (!getToken()) {

        alert(
            "Please login before adding food to cart."
        );

        window.location.href =
            "login.html";

        return;

    }


    if (!currentProduct) {

        return;

    }


    try {

        await addToCart(
            currentProduct.product_id,
            selectedQuantity
        );


        alert(
            `${selectedQuantity} item(s) added to cart!`
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
   REVIEWS
===================================================== */

async function loadReviews() {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await getProductReviews(
                productId
            );


        const reviews =
            data.reviews ||
            data;


        if (
            !Array.isArray(reviews) ||
            reviews.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No reviews yet
                    </h3>

                    <p>
                        Be the first person
                        to review this food!
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            reviews
                .map(
                    function (review) {

                        return createReviewCard(
                            review
                        );

                    }
                )
                .join("");


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                Unable to load reviews.

            </div>

        `;

    }

}


/* =====================================================
   REVIEW CARD
===================================================== */

function createReviewCard(
    review
) {

    const rating =
        Number(
            review.review_rating ||
            review.rating ||
            0
        );


    const stars =
        "⭐".repeat(
            Math.max(
                0,
                Math.min(
                    5,
                    rating
                )
            )
        );


    const username =
        review.username ||
        review.user_name ||
        "Customer";


    const text =
        review.review ||
        "No review text";


    let date = "";


    if (review.reviewed_at) {

        try {

            date =
                new Date(
                    review.reviewed_at
                ).toLocaleDateString();

        } catch (error) {

            date = "";

        }

    }


    return `

        <div class="review-card">


            <div class="review-top">

                <span class="reviewer-name">

                    👤 ${username}

                </span>


                <span class="review-date">

                    ${date}

                </span>

            </div>


            <div class="review-rating">

                ${stars || "No rating"}

            </div>


            <p class="review-text">

                ${text}

            </p>

        </div>

    `;

}


/* =====================================================
   REVIEW FORM
===================================================== */

function setupReviewForm() {

    const form =
        document.getElementById(
            "reviewForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!getToken()) {

                alert(
                    "Please login to write a review."
                );

                window.location.href =
                    "login.html";

                return;

            }


            const rating =
                document.getElementById(
                    "reviewRating"
                ).value;


            const review =
                document.getElementById(
                    "reviewText"
                ).value.trim();


            if (!rating || !review) {

                alert(
                    "Please provide a rating and review."
                );

                return;

            }


            try {

                await addReview(
                    productId,
                    review,
                    Number(rating)
                );


                alert(
                    "Review submitted successfully!"
                );


                document.getElementById(
                    "reviewForm"
                ).reset();


                loadReviews();


            } catch (error) {

                alert(
                    error.message ||
                    "Unable to submit review."
                );

            }

        }
    );

}


/* =====================================================
   ERROR
===================================================== */

function showProductError(
    message
) {

    const container =
        document.getElementById(
            "productContainer"
        );


    if (container) {

        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    Product unavailable
                </h2>

                <p>
                    ${message}
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

    }

}