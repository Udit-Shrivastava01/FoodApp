document.addEventListener("DOMContentLoaded", function () {

    if (!window.location.pathname.endsWith("orders.html")) {
        return;
    }

    if (!getToken()) {
        showOrdersLogin();
        return;
    }

    loadOrders();

});


async function loadOrders() {

    const container =
        document.getElementById("ordersContainer");

    try {

        const data =
            await getMyOrders();

        const orders =
            data.orders ||
            data.data ||
            data;

        if (!Array.isArray(orders) ||
            orders.length === 0) {

            displayNoOrders();

            return;
        }

        displayOrders(orders);

        updateCartCount();

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    Unable to load orders
                </h2>

                <p>
                    ${error.message}
                </p>

                <br>

                <button
                    class="btn btn-primary"
                    onclick="loadOrders()"
                >
                    Try Again
                </button>

            </div>

        `;

    }

}


function displayOrders(orders) {

    const container =
        document.getElementById("ordersContainer");

    container.innerHTML = `

        <div class="orders-list">

            ${orders
                .map(function (order) {

                    return createOrderCard(order);

                })
                .join("")}

        </div>

    `;

}


function createOrderCard(order) {

    const orderId =
        order.order_id ||
        order.id;

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

    const status =
        order.order_status ||
        order.status ||
        "pending";

    const date =
        order.order_date ||
        order.created_at ||
        order.createdAt;


    return `

        <div class="order-card">

            <div class="order-card-top">

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


            <div class="order-card-info">

                <div>

                    <span>
                        Order Date
                    </span>

                    <strong>
                        ${formatDate(date)}
                    </strong>

                </div>


                <div>

                    <span>
                        Payment
                    </span>

                    <strong>
                        ${order.payment_method || "N/A"}
                    </strong>

                </div>


                <div>

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${total.toFixed(2)}
                    </strong>

                </div>

            </div>


            <div class="order-card-bottom">

                <a
                    href="order-details.html?id=${orderId}"
                    class="btn btn-primary"
                >
                    View Details →
                </a>

            </div>

        </div>

    `;

}


function displayNoOrders() {

    const container =
        document.getElementById("ordersContainer");

    container.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                📦
            </div>

            <h2>
                No Orders Yet
            </h2>

            <p>
                You haven't placed any orders yet.
            </p>

            <a
                href="restaurants.html"
                class="btn btn-primary btn-large"
            >
                Order Food
            </a>

        </div>

    `;

}


function showOrdersLogin() {

    const container =
        document.getElementById("ordersContainer");

    container.innerHTML = `

        <div class="empty-cart">

            <div class="empty-cart-icon">
                🔐
            </div>

            <h2>
                Please Login
            </h2>

            <p>
                Login to see your orders.
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