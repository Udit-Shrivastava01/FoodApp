/* =====================================================
   FOODAPP API HANDLER
===================================================== */

const API_BASE_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";


/* =====================================================
   TOKEN
===================================================== */

function getToken() {
    return localStorage.getItem("foodAppToken");
}

function saveToken(token) {
    localStorage.setItem("foodAppToken", token);
}

function removeToken() {
    localStorage.removeItem("foodAppToken");
}


/* =====================================================
   USER
===================================================== */

function getUser() {
    const user = localStorage.getItem("foodAppUser");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        return null;
    }
}

function saveUser(user) {
    localStorage.setItem(
        "foodAppUser",
        JSON.stringify(user)
    );
}

function removeUser() {
    localStorage.removeItem("foodAppUser");
}


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(
    endpoint,
    method = "GET",
    body = null,
    isFormData = false
) {

    const options = {
        method: method,
        headers: {}
    };


    /* JWT */

    const token = getToken();

    if (token) {
        options.headers.Authorization =
            `Bearer ${token}`;
    }


    /* JSON BODY */

    if (body && !isFormData) {

        options.headers["Content-Type"] =
            "application/json";

        options.body =
            JSON.stringify(body);
    }


    /* FORM DATA */

    if (body && isFormData) {
        options.body = body;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            options
        );


        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `Request failed with status ${response.status}`
            );
        }


        return data;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        throw error;
    }
}


/* =====================================================
   AUTH API
===================================================== */

async function registerUser(userData) {

    return await apiRequest(
        "/auth/register",
        "POST",
        userData
    );
}


async function loginUser(email, password) {

    return await apiRequest(
        "/auth/login",
        "POST",
        {
            email: email,
            password: password
        }
    );
}


async function getProfile() {

    return await apiRequest(
        "/auth/profile",
        "GET"
    );
}


/* =====================================================
   PRODUCT API
===================================================== */

async function getProducts() {

    return await apiRequest(
        "/products",
        "GET"
    );
}


async function getProduct(productId) {

    return await apiRequest(
        `/products/${productId}`,
        "GET"
    );
}


/* =====================================================
   RESTAURANT API
===================================================== */

async function getRestaurants() {

    return await apiRequest(
        "/restaurants",
        "GET"
    );
}


async function getRestaurant(id) {

    return await apiRequest(
        `/restaurants/${id}`,
        "GET"
    );
}


/* =====================================================
   CATEGORY API
===================================================== */

async function getCategories() {

    return await apiRequest(
        "/categories",
        "GET"
    );
}


/* =====================================================
   CART API
===================================================== */

async function getCart() {

    return await apiRequest(
        "/cart",
        "GET"
    );
}


async function addToCart(
    productId,
    quantity = 1
) {

    return await apiRequest(
        "/cart",
        "POST",
        {
            product_id: productId,
            quantity: quantity
        }
    );
}


async function updateCartItem(
    cartId,
    quantity
) {

    return await apiRequest(
        `/cart/${cartId}`,
        "PUT",
        {
            quantity: quantity
        }
    );
}


async function removeCartItem(cartId) {

    return await apiRequest(
        `/cart/${cartId}`,
        "DELETE"
    );
}


/* =====================================================
   ORDER API
===================================================== */

async function createOrder(
    restaurantId,
    paymentMethod
) {

    return await apiRequest(
        "/orders",
        "POST",
        {
            restaurant_id: restaurantId,
            payment_method: paymentMethod
        }
    );
}


async function getMyOrders() {

    return await apiRequest(
        "/orders/my",
        "GET"
    );
}


async function getOrderById(orderId) {

    return await apiRequest(
        `/orders/${orderId}`,
        "GET"
    );
}


/* =====================================================
   PAYMENT API
===================================================== */

async function getPaymentForOrder(orderId) {

    return await apiRequest(
        `/payments/order/${orderId}`,
        "GET"
    );
}


/* =====================================================
   REVIEW API
===================================================== */

async function getProductReviews(productId) {

    return await apiRequest(
        `/reviews/product/${productId}`,
        "GET"
    );
}


async function addProductReview(
    productId,
    review,
    reviewRating
) {

    return await apiRequest(
        `/reviews/product/${productId}`,
        "POST",
        {
            review: review,
            review_rating: reviewRating
        }
    );
}


/* =====================================================
   FEEDBACK API
===================================================== */

async function sendFeedback(
    feedback,
    feedbackRate
) {

    return await apiRequest(
        "/feedback",
        "POST",
        {
            feedback: feedback,
            feedback_rate: feedbackRate
        }
    );
}


async function getAllFeedback() {

    return await apiRequest(
        "/feedback",
        "GET"
    );
}


/* =====================================================
   ADMIN PRODUCT API
===================================================== */

async function adminAddProduct(formData) {

    return await apiRequest(
        "/products",
        "POST",
        formData,
        true
    );
}


async function adminDeleteProduct(productId) {

    return await apiRequest(
        `/products/${productId}`,
        "DELETE"
    );
}


/* =====================================================
   ADMIN RESTAURANT API
===================================================== */

async function adminAddRestaurant(formData) {

    return await apiRequest(
        "/restaurants",
        "POST",
        formData,
        true
    );
}


/* =====================================================
   ADMIN CATEGORY API
===================================================== */

async function adminAddCategory(categoryName) {

    return await apiRequest(
        "/categories",
        "POST",
        {
            category_name: categoryName
        }
    );
}


async function adminDeleteCategory(categoryId) {

    return await apiRequest(
        `/categories/${categoryId}`,
        "DELETE"
    );
}


/* =====================================================
   ADMIN DELIVERY API
===================================================== */

async function getDeliveryData() {

    return await apiRequest(
        "/delivery",
        "GET"
    );
}


async function addDelivery(data) {

    return await apiRequest(
        "/delivery",
        "POST",
        data
    );
}


async function updateDeliveryAvailability(
    deliveryId,
    available
) {

    return await apiRequest(
        `/delivery/${deliveryId}/availability`,
        "PUT",
        {
            available: available
        }
    );
}


/* =====================================================
   ADMIN ORDER MANAGEMENT
===================================================== */

async function updateOrderStatus(
    orderId,
    status
) {

    return await apiRequest(
        `/orders/${orderId}/status`,
        "PUT",
        {
            order_status: status
        }
    );
}


async function getAllAdminOrders() {

    return await apiRequest(
        "/orders",
        "GET"
    );
}


/* =====================================================
   IMAGE HELPER
===================================================== */

function getImageUrl(imagePath) {

    if (!imagePath) {
        return null;
    }


    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }


    return `${SERVER_URL}/${imagePath.replace(/^\/+/, "")}`;
}