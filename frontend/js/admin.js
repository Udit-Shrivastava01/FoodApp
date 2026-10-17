document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname.endsWith(
                "admin.html"
            )
        ) {
            return;
        }

        checkAdminAccess();

    }
);


// =====================================================
// ADMIN ACCESS
// =====================================================

async function checkAdminAccess() {

    if (!getToken()) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const data =
            await getProfile();

        const user =
            data.user ||
            data.profile ||
            data.data ||
            data;

        const role =
            String(
                user.role ||
                user.user_role ||
                ""
            ).toLowerCase();

        if (
            role !== "admin" &&
            role !== "administrator"
        ) {

            document.body.innerHTML = `

                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🚫
                    </div>

                    <h2>
                        Access Denied
                    </h2>

                    <p>
                        You don't have permission
                        to access the admin panel.
                    </p>

                    <br>

                    <a
                        href="index.html"
                        class="btn btn-primary"
                    >
                        Back to Home
                    </a>

                </div>

            `;

            return;
        }

        loadAdminDashboard();

    }
    catch (error) {

        console.error(error);

        window.location.href =
            "login.html";

    }

}


// =====================================================
// LOAD ADMIN DASHBOARD
// =====================================================

async function loadAdminDashboard() {

    await Promise.all([
        loadProductCount(),
        loadRestaurantCount(),
        loadCategoryCount(),
        loadFeedback(),
        loadAdminOrders(),
        loadDeliveryStaff()
    ]);

}


// =====================================================
// PRODUCT COUNT
// =====================================================

async function loadProductCount() {

    try {

        const data =
            await getProducts();

        const products =
            data.products ||
            data.data ||
            data;

        document.getElementById(
            "productCount"
        ).textContent =
            Array.isArray(products)
                ? products.length
                : 0;

    }
    catch (error) {

        console.error(error);

    }

}


// =====================================================
// RESTAURANT COUNT
// =====================================================

async function loadRestaurantCount() {

    try {

        const data =
            await getRestaurants();

        const restaurants =
            data.restaurants ||
            data.data ||
            data;

        document.getElementById(
            "restaurantCount"
        ).textContent =
            Array.isArray(restaurants)
                ? restaurants.length
                : 0;

    }
    catch (error) {

        console.error(error);

    }

}


// =====================================================
// CATEGORY COUNT
// =====================================================

async function loadCategoryCount() {

    try {

        const data =
            await getCategories();

        const categories =
            data.categories ||
            data.data ||
            data;

        document.getElementById(
            "categoryCount"
        ).textContent =
            Array.isArray(categories)
                ? categories.length
                : 0;

    }
    catch (error) {

        console.error(error);

    }

}


// =====================================================
// ADD PRODUCT
// =====================================================

async function addProduct(event) {

    event.preventDefault();

    const button =
        document.getElementById(
            "productButton"
        );

    const formData =
        new FormData();

    formData.append(
        "product_name",
        document.getElementById(
            "productName"
        ).value.trim()
    );

    formData.append(
        "product_description",
        document.getElementById(
            "productDescription"
        ).value.trim()
    );

    formData.append(
        "product_price",
        document.getElementById(
            "productPrice"
        ).value
    );

    formData.append(
        "restraunt_id",
        document.getElementById(
            "productRestaurantId"
        ).value
    );

    formData.append(
        "category_id",
        document.getElementById(
            "productCategoryId"
        ).value
    );

    const image =
        document.getElementById(
            "productImage"
        ).files[0];

    if (image) {

        formData.append(
            "product_image",
            image
        );

    }

    button.disabled = true;

    button.textContent =
        "Adding...";

    try {

        await adminAddProduct(
            formData
        );

        showAdminMessage(
            "Product added successfully!",
            "success"
        );

        document
            .getElementById(
                "productForm"
            )
            .reset();

        await loadProductCount();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to add product.",
            "error"
        );

    }

    button.disabled = false;

    button.textContent =
        "Add Product";

}


// =====================================================
// ADD RESTAURANT
// =====================================================

async function addRestaurant(event) {

    event.preventDefault();

    const button =
        document.getElementById(
            "restaurantButton"
        );

    // Get every field from the restaurant form.
    const restaurantName =
        document.getElementById(
            "restaurantName"
        ).value.trim();

    const ownerName =
        document.getElementById(
            "restaurantOwnerName"
        ).value.trim();

    const gstNumber =
        document.getElementById(
            "restaurantGstN"
        ).value.trim();

    const contactNumber =
        document.getElementById(
            "restaurantContact"
        ).value.trim();

    const address =
        document.getElementById(
            "restaurantAddress"
        ).value.trim();

    const openingTime =
        document.getElementById(
            "openingTime"
        ).value;

    const closingTime =
        document.getElementById(
            "closingTime"
        ).value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!restaurantName) {

        showAdminMessage(
            "Restaurant name is required.",
            "error"
        );

        return;
    }

    if (!ownerName) {

        showAdminMessage(
            "Owner name is required.",
            "error"
        );

        return;
    }

    if (!gstNumber) {

        showAdminMessage(
            "Restaurant GSTN is required.",
            "error"
        );

        return;
    }

    if (!contactNumber) {

        showAdminMessage(
            "Contact number is required.",
            "error"
        );

        return;
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {

        showAdminMessage(
            "Contact number must contain exactly 10 digits.",
            "error"
        );

        return;
    }

    if (!address) {

        showAdminMessage(
            "Restaurant address is required.",
            "error"
        );

        return;
    }

    if (!openingTime || !closingTime) {

        showAdminMessage(
            "Opening and closing time are required.",
            "error"
        );

        return;
    }


    // =================================================
    // CREATE FORM DATA
    // =================================================

    const formData =
        new FormData();


    // IMPORTANT:
    // These names MUST match req.body in
    // restaurantcontroller.js

    formData.append(
        "restraunt_name",
        restaurantName
    );

    formData.append(
        "restraunt_gstN",
        gstNumber
    );

    formData.append(
        "owner_name",
        ownerName
    );

    formData.append(
        "contact_num",
        contactNumber
    );

    formData.append(
        "address",
        address
    );

    formData.append(
        "opening_time",
        openingTime
    );

    formData.append(
        "closing_time",
        closingTime
    );


    // =================================================
    // RESTAURANT IMAGE
    // =================================================

    const image =
        document.getElementById(
            "restaurantImage"
        ).files[0];

    if (image) {

        formData.append(
            "image",
            image
        );

    }


    console.log(
        "Restaurant data being sent:"
    );

    console.log({
        restraunt_name:
            restaurantName,

        restraunt_gstN:
            gstNumber,

        owner_name:
            ownerName,

        contact_num:
            contactNumber,

        address:
            address,

        opening_time:
            openingTime,

        closing_time:
            closingTime
    });


    // =================================================
    // SUBMIT
    // =================================================

    button.disabled = true;

    button.textContent =
        "Adding...";

    try {

        await adminAddRestaurant(
            formData
        );

        showAdminMessage(
            "Restaurant added successfully!",
            "success"
        );

        document
            .getElementById(
                "restaurantForm"
            )
            .reset();

        await loadRestaurantCount();

    }
    catch (error) {

        console.error(
            "Add Restaurant Error:",
            error
        );

        showAdminMessage(
            error.message ||
            "Unable to add restaurant.",
            "error"
        );

    }

    button.disabled = false;

    button.textContent =
        "Add Restaurant";

}


// =====================================================
// ADD CATEGORY
// =====================================================

async function addCategory(event) {

    event.preventDefault();

    const input =
        document.getElementById(
            "categoryName"
        );

    const name =
        input.value.trim();

    if (!name) {
        return;
    }

    try {

        await adminAddCategory(
            name
        );

        showAdminMessage(
            "Category added successfully!",
            "success"
        );

        input.value = "";

        await loadCategoryCount();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to add category.",
            "error"
        );

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(event) {

    event.preventDefault();

    const input =
        document.getElementById(
            "deleteProductId"
        );

    const productId =
        input.value;

    const confirmed =
        confirm(
            `Delete product #${productId}?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await adminDeleteProduct(
            productId
        );

        showAdminMessage(
            "Product deleted successfully!",
            "success"
        );

        input.value = "";

        await loadProductCount();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to delete product.",
            "error"
        );

    }

}


// =====================================================
// DELETE CATEGORY
// =====================================================

async function deleteCategory(event) {

    event.preventDefault();

    const input =
        document.getElementById(
            "deleteCategoryId"
        );

    const categoryId =
        input.value;

    const confirmed =
        confirm(
            `Delete category #${categoryId}?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await adminDeleteCategory(
            categoryId
        );

        showAdminMessage(
            "Category deleted successfully!",
            "success"
        );

        input.value = "";

        await loadCategoryCount();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to delete category.",
            "error"
        );

    }

}


// =====================================================
// FEEDBACK
// =====================================================

async function loadFeedback() {

    const container =
        document.getElementById(
            "feedbackContainer"
        );

    if (!container) {
        return;
    }

    try {

        const data =
            await getAllFeedback();

        const feedback =
            data.feedback ||
            data.data ||
            data;

        const list =
            Array.isArray(feedback)
                ? feedback
                : [];

        document.getElementById(
            "feedbackCount"
        ).textContent =
            list.length;

        if (list.length === 0) {

            container.innerHTML = `

                <div class="no-reviews">

                    <p>
                        No customer feedback yet.
                    </p>

                </div>

            `;

            return;
        }

        container.innerHTML = `

            <div class="feedback-list">

                ${
                    list
                        .map(
                            createFeedbackRow
                        )
                        .join("")
                }

            </div>

        `;

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


function createFeedbackRow(item) {

    const username =
        item.username ||
        item.user_name ||
        "Customer";

    const feedback =
        item.feedback ||
        item.feedback_text ||
        "";

    const rating =
        Number(
            item.feedback_rate ||
            item.rating ||
            0
        );

    return `

        <div class="feedback-row">

            <div class="review-avatar">
                ${getInitials(username)}
            </div>

            <div class="feedback-content">

                <strong>
                    ${username}
                </strong>

                <div class="review-stars">
                    ${createStars(rating)}
                </div>

                <p>
                    ${feedback}
                </p>

            </div>

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


// =====================================================
// ADMIN ORDERS
// =====================================================

async function loadAdminOrders() {

    const container =
        document.getElementById(
            "adminOrdersContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="loading">
            Loading orders...
        </div>

    `;

    try {

        const data =
            await getAllAdminOrders();

        const orders =
            data.orders ||
            data.data ||
            data;

        if (
            !Array.isArray(orders) ||
            orders.length === 0
        ) {

            container.innerHTML = `

                <div class="no-reviews">

                    <p>
                        No orders found.
                    </p>

                </div>

            `;

            return;
        }

        container.innerHTML = `

            <div class="admin-orders-table-wrapper">

                <table class="admin-orders-table">

                    <thead>

                        <tr>

                            <th>
                                Order
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Restaurant
                            </th>

                            <th>
                                Total
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Update
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            orders
                                .map(
                                    createAdminOrderRow
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


function createAdminOrderRow(order) {

    const orderId =
        order.order_id ||
        order.id;

    const username =
        order.username ||
        order.user_name ||
        "Customer";

    const restaurant =
        order.restraunt_name ||
        order.restaurant_name ||
        "Restaurant";

    const total =
        Number(
            order.total_amount ||
            order.total ||
            0
        );

    const status =
        order.order_status ||
        "pending";

    return `

        <tr>

            <td>
                <strong>
                    #${orderId}
                </strong>
            </td>

            <td>
                ${username}
            </td>

            <td>
                ${restaurant}
            </td>

            <td>
                ₹${total.toFixed(2)}
            </td>

            <td>

                <span class="
                    order-status
                    ${getStatusClass(status)}
                ">
                    ${formatStatus(status)}
                </span>

            </td>

            <td>

                <select
                    class="admin-status-select"
                    id="status-${orderId}"
                >

                    ${createStatusOptions(status)}

                </select>

                <button
                    class="btn btn-small btn-primary"
                    onclick="
                        changeAdminOrderStatus(
                            ${orderId}
                        )
                    "
                >
                    Update
                </button>

            </td>

        </tr>

    `;

}


function createStatusOptions(currentStatus) {

    const statuses = [

        "pending",
        "confirmed",
        "cooking",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled"

    ];

    return statuses
        .map(function (status) {

            return `

                <option
                    value="${status}"
                    ${
                        status === currentStatus
                            ? "selected"
                            : ""
                    }
                >
                    ${formatStatus(status)}
                </option>

            `;

        })
        .join("");

}


async function changeAdminOrderStatus(
    orderId
) {

    const select =
        document.getElementById(
            `status-${orderId}`
        );

    if (!select) {
        return;
    }

    const status =
        select.value;

    try {

        await updateOrderStatus(
            orderId,
            status
        );

        showAdminMessage(
            `Order #${orderId} updated successfully.`,
            "success"
        );

        await loadAdminOrders();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to update order.",
            "error"
        );

    }

}


// =====================================================
// DELIVERY STAFF
// =====================================================

async function loadDeliveryStaff() {

    const container =
        document.getElementById(
            "deliveryContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="loading">
            Loading delivery staff...
        </div>

    `;

    try {

        const data =
            await getDeliveryData();

        const delivery =
            data.delivery ||
            data.deliveries ||
            data.data ||
            data;

        if (
            !Array.isArray(delivery) ||
            delivery.length === 0
        ) {

            container.innerHTML = `

                <div class="no-reviews">

                    <p>
                        No delivery staff found.
                    </p>

                </div>

            `;

            return;
        }

        container.innerHTML = `

            <div class="delivery-list">

                ${
                    delivery
                        .map(
                            createDeliveryRow
                        )
                        .join("")
                }

            </div>

        `;

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


function createDeliveryRow(person) {

    const id =
        person.delivery_id ||
        person.id;

    const name =
        person.delivery_name ||
        person.name ||
        person.username ||
        "Delivery Person";

    const contact =
        person.contact ||
        person.contact_number ||
        person.phone ||
        "N/A";

    const available =
        person.is_available ??
        person.available ??
        false;

    return `

        <div class="delivery-row">

            <div class="delivery-person-avatar">
                🚴
            </div>

            <div class="delivery-person-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    📱 ${contact}
                </span>

            </div>

            <span class="
                delivery-availability
                ${
                    available
                        ? "available"
                        : "unavailable"
                }
            ">

                ${
                    available
                        ? "Available"
                        : "Unavailable"
                }

            </span>

            <button
                class="
                    btn
                    btn-small
                    ${
                        available
                            ? "btn-danger"
                            : "btn-primary"
                    }
                "
                onclick="
                    toggleDeliveryAvailability(
                        ${id},
                        ${!available}
                    )
                "
            >

                ${
                    available
                        ? "Set Unavailable"
                        : "Set Available"
                }

            </button>

        </div>

    `;

}


async function addDeliveryStaff(event) {

    event.preventDefault();

    const button =
        document.getElementById(
            "deliveryButton"
        );

    const name =
        document.getElementById(
            "deliveryName"
        ).value.trim();

    const contact =
        document.getElementById(
            "deliveryContact"
        ).value.trim();

    if (!name || !contact) {

        showAdminMessage(
            "Please enter name and contact.",
            "error"
        );

        return;
    }

    button.disabled = true;

    button.textContent =
        "Adding...";

    try {

        await addDelivery({

            delivery_name:
                name,

            contact:
                contact,

            is_available:
                true

        });

        showAdminMessage(
            "Delivery person added successfully.",
            "success"
        );

        document
            .getElementById(
                "deliveryForm"
            )
            .reset();

        await loadDeliveryStaff();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to add delivery person.",
            "error"
        );

    }

    button.disabled = false;

    button.textContent =
        "Add Delivery Person";

}


async function toggleDeliveryAvailability(
    deliveryId,
    available
) {

    try {

        await updateDeliveryAvailability(
            deliveryId,
            available
        );

        showAdminMessage(
            "Delivery availability updated.",
            "success"
        );

        await loadDeliveryStaff();

    }
    catch (error) {

        showAdminMessage(
            error.message ||
            "Unable to update availability.",
            "error"
        );

    }

}


// =====================================================
// HELPERS
// =====================================================

function showAdminMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "adminMessage"
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