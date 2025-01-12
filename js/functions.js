function updatePlaceholders(html, params = {}) {
    for (var key in params) {
        html = html.replaceAll("{{"+key+"}}", params[key]);
    }
    return html;
}

function resetStorage() {
    localStorage.removeItem("meals");
    localStorage.removeItem("mealplan");

    history.pushState(null, '', '/');
    handleUrl();
}

function getMeals(id = false) {
    var meals = localStorage.getItem("meals");

    try {
        meals = JSON.parse(meals);
        if (!meals) {
            meals = [];
        }
    } catch(e) {
        meals = [];
        localStorage.setItem("meals", meals);
    }
    if (id !== false) {
        var foundmeal = false;

        if (meals[id]) {
            foundmeal = meals[id];
        }
        return foundmeal;
    }

    return meals;
}

function getMealPlan() {
    var mealplan = localStorage.getItem("mealplan");

    try {
        mealplan = JSON.parse(mealplan);
        if (!mealplan) {
            mealplan = [];
        }
    } catch(e) {
        mealplan = [];
        localStorage.setItem("mealplan", mealplan);
    }

    return mealplan;
}

function addMeal(object) {
    var meals = getMeals();
    meals.push(object);
    localStorage.setItem("meals", JSON.stringify(meals));
}

function updateMeal(key, object) {
    var meals = getMeals();
    meals.forEach(function(meal, index){
        if (key == index) {
            meals[key] = object;
        }
    });
    localStorage.setItem("meals", JSON.stringify(meals));
}

function deleteMeal(id){
    var meals = getMeals();

    meals.splice(id, 1);
    localStorage.setItem("meals", JSON.stringify(meals));
}

// Adds an event to the document so chaning elements dynamically will still have the events assigned to them
function documentEvent(event, selector, todo) {
    document.addEventListener(event, function(e){
        if (e.target.closest(selector)) {
            todo(e.target, e);
        }
    });
}

// Updates the page body with a unique ID and HTML
function updateBody(id, html) {
    var body = document.getElementById("body");
    body.innerHTML = "";

    var iddiv = document.createElement("div");
    iddiv.id = id;

    iddiv.innerHTML = html;

    body.appendChild(iddiv);
}

// Handles updating the page body based on the requested URL
function handleUrl() {
    const path = window.location.pathname;
    var bodyid = "meals";
    var bodyhtml = displayMealList();

    switch (path) {
        case '/':
            bodyid = "meals";
            bodyhtml = displayMealList();
            break;
        case '/addmeal':
            bodyid = "addmeal";
            bodyhtml = displayAddMeal();
            break;
        case '/updatemeal':
            var params = new URLSearchParams(window.location.search);
            if (params.has("id")) {
                var id = params.get("id");
                bodyid = "updatemeal";
                bodyhtml = displayUpdateMeal(id);
            }
            break;
        case '/meal':
            var params = new URLSearchParams(window.location.search);
            if (params.has("id")) {
                var id = params.get("id");
                var meal = getMeals(id);
                if (meal) {
                    bodyid = "openmeal";
                    bodyhtml = displayOpenMeal(meal, id);
                }
            }
            break;
        case '/mealplan':
            bodyid = "mealplan";
            bodyhtml = displayMealPlan();
            break;
        default:
            break;
    }

    updateBody(bodyid, bodyhtml);
}

function addNotification(type, text) {
    var notification = document.createElement("p");
    notification.classList.add("notification");
    notification.classList.add(type);
    notification.innerHTML = text;
    document.querySelector("#notifications").appendChild(notification);
    // remove notification after 5 seconds
    setTimeout(function(){
        notification.remove();
    }, 5000);
}

function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}