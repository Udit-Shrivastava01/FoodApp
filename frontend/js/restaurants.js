/* =====================================================
   RESTAURANTS PAGE
===================================================== */

let allRestaurants = [];

let currentFilter = "all";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !window.location.pathname
                .endsWith("restaurants.html")
        ) {

            return;

        }


        loadAllRestaurants();

        setupRestaurantSearch();

        setupRestaurantFilters();

    }
);


/* =====================================================
   LOAD RESTAURANTS
===================================================== */

async function loadAllRestaurants() {

    const container =
        document.getElementById(
            "restaurantsContainer"
        );


    try {

        const data =
            await getRestaurants();


        allRestaurants =
            data.restaurants ||
            data;


        if (
            !Array.isArray(allRestaurants) ||
            allRestaurants.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No restaurants found
                    </h3>

                    <p>
                        Restaurants will appear here
                        when they are added.
                    </p>

                </div>

            `;

            return;

        }


        displayRestaurants(
            allRestaurants
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load restaurants
                </h3>

                <p>
                    Make sure your backend
                    and SQL Server are running.
                </p>

            </div>

        `;

    }

}


/* =====================================================
   DISPLAY
===================================================== */

function displayRestaurants(restaurants) {

    const container =
        document.getElementById(
            "restaurantsContainer"
        );


    let filtered =
        restaurants.filter(
            function (restaurant) {

                const isOpen =
                    restaurant.is_open === "yes" ||
                    restaurant.is_open === true ||
                    restaurant.is_open === 1;


                if (currentFilter === "open") {

                    return isOpen;

                }


                if (currentFilter === "closed") {

                    return !isOpen;

                }


                return true;

            }
        );


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No restaurants match
                your search/filter.

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                function (restaurant) {

                    return createRestaurantCard(
                        restaurant
                    );

                }
            )
            .join("");

}


/* =====================================================
   SEARCH
===================================================== */

function setupRestaurantSearch() {

    const search =
        document.getElementById(
            "restaurantSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            const searchText =
                search.value
                    .trim()
                    .toLowerCase();


            const filtered =
                allRestaurants.filter(
                    function (restaurant) {

                        const name =
                            (
                                restaurant.restraunt_name ||
                                ""
                            ).toLowerCase();


                        const address =
                            (
                                restaurant.address ||
                                ""
                            ).toLowerCase();


                        return (
                            name.includes(searchText) ||
                            address.includes(searchText)
                        );

                    }
                );


            displayRestaurants(
                filtered
            );

        }
    );

}


/* =====================================================
   FILTERS
===================================================== */

function setupRestaurantFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    const search =
                        document.getElementById(
                            "restaurantSearch"
                        );


                    const searchText =
                        search.value
                            .trim()
                            .toLowerCase();


                    const filtered =
                        allRestaurants.filter(
                            function (restaurant) {

                                const name =
                                    (
                                        restaurant.restraunt_name ||
                                        ""
                                    ).toLowerCase();


                                const address =
                                    (
                                        restaurant.address ||
                                        ""
                                    ).toLowerCase();


                                return (
                                    name.includes(searchText) ||
                                    address.includes(searchText)
                                );

                            }
                        );


                    displayRestaurants(
                        filtered
                    );

                }
            );

        }
    );

}