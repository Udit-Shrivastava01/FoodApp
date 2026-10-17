let currentProductId = null;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname.endsWith(
                "product.html"
            )
        ) {
            return;
        }


        const params =
            new URLSearchParams(
                window.location.search
            );


        currentProductId =
            params.get("id");


        if (!currentProductId) {
            return;
        }


        loadProductReviews();

    }
);


async function loadProductReviews() {

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
                currentProductId
            );


        const reviews =
            data.reviews ||
            data.data ||
            data;


        if (
            !Array.isArray(reviews) ||
            reviews.length === 0
        ) {

            container.innerHTML = `

                <div class="no-reviews">

                    <div class="empty-cart-icon">
                        ⭐
                    </div>

                    <h3>
                        No Reviews Yet
                    </h3>

                    <p>
                        Be the first person to
                        review this product.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            reviews
                .map(
                    createReviewCard
                )
                .join("");

    }
    catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load reviews
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


function createReviewCard(review) {

    const username =
        review.username ||
        review.user_name ||
        review.name ||
        "Customer";


    const text =
        review.review ||
        review.review_text ||
        review.comment ||
        "";


    const rating =
        Number(
            review.review_rating ||
            review.rating ||
            0
        );


    const date =
        review.created_at ||
        review.review_date ||
        review.date;


    return `

        <div class="review-card">


            <div class="review-card-top">


                <div class="review-user">

                    <div class="review-avatar">

                        ${getInitials(username)}

                    </div>


                    <div>

                        <strong>
                            ${username}
                        </strong>

                        <span>
                            ${formatReviewDate(date)}
                        </span>

                    </div>

                </div>


                <div class="review-stars">

                    ${createStars(rating)}

                </div>


            </div>


            <p class="review-text">

                ${text}

            </p>


        </div>

    `;

}


function createStars(rating) {

    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rating
            ? "★"
            : "☆";

    }


    return stars;

}


async function submitProductReview(event) {

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


    const button =
        document.getElementById(
            "reviewButton"
        );


    if (!rating || !review) {

        showReviewMessage(
            "Please provide rating and review.",
            "error"
        );

        return;
    }


    button.disabled = true;

    button.textContent =
        "Submitting...";


    try {

        await addProductReview(
            currentProductId,
            review,
            Number(rating)
        );


        showReviewMessage(
            "Your review was submitted successfully!",
            "success"
        );


        document
            .getElementById(
                "reviewForm"
            )
            .reset();


        await loadProductReviews();

    }
    catch (error) {

        console.error(error);


        showReviewMessage(
            error.message ||
            "Unable to submit review.",
            "error"
        );

    }


    button.disabled = false;

    button.textContent =
        "Submit Review";

}


function showReviewMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "reviewMessage"
        );


    message.className =
        `message ${type}`;


    message.textContent =
        text;

}


function getInitials(name) {

    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


function formatReviewDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}