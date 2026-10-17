let currentOrder = null;


document.addEventListener("DOMContentLoaded", function () {

    if (!window.location.pathname.endsWith("order-details.html")) {
        return;
    }

    if (!getToken()) {

        window.location.href =
            "login.html";

        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const orderId =
        params.get("id");


    if (!orderId) {

        showOrderError(
            "Order ID is missing."
        );

        return;
    }


    loadOrderDetails(orderId);

});


async function loadOrderDetails(orderId) {

    const container =
        document.getElementById(
            "orderDetailsContainer"
        );

    try {

        const data =
            await getOrderById(orderId);

        currentOrder =
            data.order ||
            data.data ||
            data;

        if (!currentOrder) {

            throw new Error(
                "Order not found."
            );

        }


        let payment = null;

        try {

            const paymentData =
                await getPaymentForOrder(orderId);

            payment =
                paymentData.payment ||
                paymentData.data ||
                paymentData;

        }
        catch (paymentError) {

            console.log(
                "Payment information unavailable:",
                paymentError.message
            );

        }


        displayOrderDetails(
            currentOrder,
            payment
        );

    }
    catch (error) {

        console.error(error);

        showOrderError(
            error.message ||
            "Unable to load order."
        );

    }

}


function displayOrderDetails(
    order,
    payment
) {

    const container =
        document.getElementById(
            "orderDetailsContainer"
        );


    const orderId =
        order.order_id ||
        order.id;


    const status =
        order.order_status ||
        order.status ||
        "pending";


    const restaurantName =
        order.restraunt_name ||
        order.restaurant_name ||
        order.restaurant ||
        "Restaurant";


    const total =
        Number(
            order.total_amount ||
            order.order_total ||
            order.total ||
            0
        );


    const paymentMethod =
        order.payment_method ||
        payment?.payment_method ||
        "N/A";


    const paymentStatus =
        payment?.payment_status ||
        payment?.status ||
        (
            paymentMethod !== "N/A"
            ? "Successful"
            : "N/A"
        );


    const items =
        order.items ||
        order.order_items ||
        order.products ||
        [];


    container.innerHTML = `

        <div class="order-details-layout">


            <div class="order-details-main">


                <!-- ORDER HEADER -->

                <div class="order-detail-card">

                    <div class="order-detail-header">

                        <div>

                            <span class="order-label">
                                ORDER #${orderId}
                            </span>

                            <h2>
                                ${restaurantName}
                            </h2>

                        </div>


                        <span class="
                            order-status
                            ${getStatusClass(status)}
                        ">
                            ${formatStatus(status)}
                        </span>

                    </div>


                    <div class="order-date">

                        ${formatDate(
                            order.order_date ||
                            order.created_at ||
                            order.createdAt
                        )}

                    </div>

                </div>


                <!-- ORDER STATUS -->

                <div class="order-detail-card">

                    <h2>
                        Order Status
                    </h2>


                    <div class="status-timeline">

                        ${createTimeline(status)}

                    </div>

                </div>


                <!-- ITEMS -->

                <div class="order-detail-card">

                    <h2>
                        🍽️ Ordered Items
                    </h2>


                    <div class="order-detail-items">

                        ${
                            items.length > 0
                            ? items
                                .map(
                                    createOrderItem
                                )
                                .join("")
                            : `
                                <p class="muted-text">
                                    Order item details
                                    are not available.
                                </p>
                            `
                        }

                    </div>

                </div>


                <!-- DELIVERY -->

                <div class="order-detail-card">

                    <h2>
                        📍 Delivery Information
                    </h2>


                    <div class="delivery-info">

                        <div>

                            <span>
                                Address
                            </span>

                            <strong>
                                ${
                                    order.delivery_address ||
                                    order.address ||
                                    "Registered address"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Contact
                            </span>

                            <strong>
                                ${
                                    order.contact ||
                                    order.contact_number ||
                                    "Not available"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


            </div>


            <!-- SUMMARY -->

            <aside class="order-detail-summary">

                <h2>
                    Order Summary
                </h2>


                <div class="summary-row">

                    <span>
                        Restaurant
                    </span>

                    <span>
                        ${restaurantName}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Payment
                    </span>

                    <span>
                        ${paymentMethod}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Payment Status
                    </span>

                    <span class="payment-success">
                        ${paymentStatus}
                    </span>

                </div>


                <div class="summary-divider"></div>


                <div class="summary-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${total.toFixed(2)}
                    </strong>

                </div>


                <a
                    href="orders.html"
                    class="btn btn-primary btn-full"
                >
                    ← My Orders
                </a>


                <a
                    href="restaurants.html"
                    class="continue-shopping"
                >
                    Order More Food
                </a>

            </aside>


        </div>

    `;

}


function createOrderItem(item) {

    const name =
        item.product_name ||
        item.name ||
        "Food Item";


    const quantity =
        Number(
            item.quantity ||
            item.order_quantity ||
            1
        );


    const price =
        Number(
            item.price_at_order ||
            item.product_price ||
            item.price ||
            0
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

        <div class="order-detail-item">


            <div class="order-detail-item-image">

                ${
                    image
                    ? `
                        <img
                            src="${image}"
                            alt="${name}"
                            onerror="
                                this.style.display='none';
                                this.parentElement.innerHTML='🍽️';
                            "
                        >
                    `
                    : "🍽️"
                }

            </div>


            <div class="order-detail-item-info">

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


function createTimeline(currentStatus) {

    const statuses = [
        "pending",
        "confirmed",
        "cooking",
        "ready",
        "out_for_delivery",
        "delivered"
    ];


    const currentIndex =
        statuses.indexOf(
            String(currentStatus).toLowerCase()
        );


    return statuses
        .map(function (status, index) {

            let className = "";

            if (index < currentIndex) {
                className = "completed";
            }

            if (index === currentIndex) {
                className = "current";
            }


            return `

                <div class="
                    timeline-step
                    ${className}
                ">

                    <div class="timeline-dot">
                        ${index < currentIndex ? "✓" : ""}
                    </div>

                    <span>
                        ${formatStatus(status)}
                    </span>

                </div>

            `;

        })
        .join("");

}


function formatStatus(status) {

    return String(status)
        .replaceAll("_", " ")
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });

}


function getStatusClass(status) {

    const value =
        String(status).toLowerCase();


    if (value === "delivered") {
        return "status-delivered";
    }


    if (value === "cancelled") {
        return "status-cancelled";
    }


    if (
        value === "out_for_delivery" ||
        value === "out for delivery"
    ) {
        return "status-delivery";
    }


    if (
        value === "confirmed" ||
        value === "ready"
    ) {
        return "status-confirmed";
    }


    return "status-pending";

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
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


function showOrderError(message) {

    const container =
        document.getElementById(
            "orderDetailsContainer"
        );


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-cart-icon">
                ⚠️
            </div>

            <h2>
                Unable to Load Order
            </h2>

            <p>
                ${message}
            </p>

            <br>

            <a
                href="orders.html"
                class="btn btn-primary"
            >
                Back to Orders
            </a>

        </div>

    `;

}