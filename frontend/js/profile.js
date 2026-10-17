document.addEventListener("DOMContentLoaded", function () {

    if (!window.location.pathname.endsWith("profile.html")) {
        return;
    }


    if (!getToken()) {

        window.location.href =
            "login.html";

        return;
    }


    loadProfile();

});


async function loadProfile() {

    const container =
        document.getElementById(
            "profileContainer"
        );


    try {

        const data =
            await getProfile();


        const user =
            data.user ||
            data.profile ||
            data.data ||
            data;


        if (!user) {

            throw new Error(
                "Profile information not found."
            );

        }


        displayProfile(user);

        updateCartCount();

    }
    catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    Unable to load profile
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


function displayProfile(user) {

    const container =
        document.getElementById(
            "profileContainer"
        );


    const username =
        user.username ||
        user.name ||
        "User";


    const email =
        user.email ||
        "Not available";


    const contact =
        user.contact ||
        user.contact_number ||
        user.phone ||
        "Not available";


    const address =
        user.address ||
        "No address added";


    const role =
        user.role ||
        user.user_role ||
        "customer";


    container.innerHTML = `

        <div class="profile-layout">


            <!-- PROFILE CARD -->

            <div class="profile-card">


                <div class="profile-avatar">

                    ${getInitials(username)}

                </div>


                <h2>
                    ${username}
                </h2>


                <p class="profile-role">
                    ${role}
                </p>


                <div class="profile-divider"></div>


                <div class="profile-info">


                    <div class="profile-info-row">

                        <span>
                            👤 Name
                        </span>

                        <strong>
                            ${username}
                        </strong>

                    </div>


                    <div class="profile-info-row">

                        <span>
                            ✉️ Email
                        </span>

                        <strong>
                            ${email}
                        </strong>

                    </div>


                    <div class="profile-info-row">

                        <span>
                            📱 Contact
                        </span>

                        <strong>
                            ${contact}
                        </strong>

                    </div>


                    <div class="profile-info-row">

                        <span>
                            📍 Address
                        </span>

                        <strong>
                            ${address}
                        </strong>

                    </div>


                </div>


                <button
                    class="btn btn-danger btn-full"
                    onclick="logoutUser()"
                >
                    Logout
                </button>


            </div>


            <!-- FEEDBACK -->

            <div class="feedback-card">


                <h2>
                    ⭐ Give Feedback
                </h2>


                <p>
                    Tell us about your FoodApp experience.
                </p>


                <form
                    id="feedbackForm"
                    onsubmit="submitFeedback(event)"
                >


                    <div class="form-group">

                        <label>
                            Rating
                        </label>


                        <select
                            id="feedbackRate"
                            required
                        >

                            <option value="">
                                Select rating
                            </option>

                            <option value="5">
                                ⭐⭐⭐⭐⭐ Excellent
                            </option>

                            <option value="4">
                                ⭐⭐⭐⭐ Good
                            </option>

                            <option value="3">
                                ⭐⭐⭐ Average
                            </option>

                            <option value="2">
                                ⭐⭐ Poor
                            </option>

                            <option value="1">
                                ⭐ Very Poor
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Your Feedback
                        </label>


                        <textarea
                            id="feedbackText"
                            rows="6"
                            placeholder="Write your feedback..."
                            required
                        ></textarea>

                    </div>


                    <button
                        type="submit"
                        id="feedbackButton"
                        class="btn btn-primary"
                    >
                        Submit Feedback
                    </button>


                </form>


                <div
                    id="feedbackMessage"
                    class="message"
                >
                </div>


            </div>


        </div>

    `;

}


async function submitFeedback(event) {

    event.preventDefault();


    const button =
        document.getElementById(
            "feedbackButton"
        );


    const rating =
        document.getElementById(
            "feedbackRate"
        ).value;


    const feedback =
        document.getElementById(
            "feedbackText"
        ).value.trim();


    if (!rating || !feedback) {

        showFeedbackMessage(
            "Please provide both rating and feedback.",
            "error"
        );

        return;
    }


    button.disabled = true;

    button.textContent =
        "Submitting...";


    try {

        await sendFeedback(
            feedback,
            Number(rating)
        );


        showFeedbackMessage(
            "Thank you! Your feedback has been submitted.",
            "success"
        );


        document
            .getElementById("feedbackForm")
            .reset();

    }
    catch (error) {

        console.error(error);


        showFeedbackMessage(
            error.message ||
            "Unable to submit feedback.",
            "error"
        );

    }


    button.disabled = false;

    button.textContent =
        "Submit Feedback";

}


function showFeedbackMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "feedbackMessage"
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


function logoutUser() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem("token");

    localStorage.removeItem("user");


    window.location.href =
        "index.html";

}