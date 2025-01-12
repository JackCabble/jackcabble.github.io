console.log(localStorage);
//localStorage.clear();
//resetStorage();

documentEvent("click", "#resetstorage", function(){
    resetStorage();
});

documentEvent("click", ".foldouttoggle", function(button, e){
    e.preventDefault();
    button.parentElement.classList.toggle("open");
});

documentEvent("submit", "#addmeal", function(formEl, e){
    e.preventDefault();

    var name = document.getElementById("newmealname").value;
    var recipe = document.getElementById("newmealrecipe").value;
    var mealtype = document.getElementById("mealtype").value;

    var ingredients = [];
    formEl.querySelectorAll(".ingredientrow").forEach(function(row){
        var ingredient = row.querySelector("input[name='ingredient']").value;
        var quantity = row.querySelector("input[name='quantity']").value;
        var unit = row.querySelector("select[name='unit']").value;
        if (ingredient != "" && quantity > 0 && unit != "") {
            var obj = {ingredient: ingredient, quantity: quantity, unit: unit};
            ingredients.push(obj);
        }
    });
    var images = [];
    formEl.querySelectorAll("input[name='image']").forEach(function(image){
        images.push(image.value);
    });
    if (name != "" && ingredients.length > 0) {
        var mealobject = {name: name, mealtype: mealtype, recipe: recipe, ingredients: ingredients, images: images};
        addMeal(mealobject);
        history.pushState(null, '', '/');
        handleUrl();
    } else {
        addNotification("error", "You have missed a required field");
    }
});

documentEvent("submit", "#updatemeal", function(formEl, e){
    e.preventDefault();

    var name = document.getElementById("newmealname").value;
    var recipe = document.getElementById("newmealrecipe").value;
    var mealid = document.getElementById("mealid").value;
    var mealtype = document.getElementById("mealtype").value;

    var ingredients = [];
    formEl.querySelectorAll(".ingredientrow").forEach(function(row){
        var ingredient = row.querySelector("input[name='ingredient']").value;
        var quantity = row.querySelector("input[name='quantity']").value;
        var unit = row.querySelector("select[name='unit']").value;
        if (ingredient != "" && quantity > 0 && unit != "") {
            var obj = {ingredient: ingredient, quantity: quantity, unit: unit};
            ingredients.push(obj);
        }
    });
    var images = [];
    formEl.querySelectorAll("input[name='image']").forEach(function(image){
        images.push(image.value);
    });
    if (name != "" && ingredients.length > 0) {
        var mealobject = {name: name, mealtype: mealtype, recipe: recipe, ingredients: ingredients, images: images};
        updateMeal(mealid, mealobject);
        history.pushState(null, '', '/');
        handleUrl();
    } else {
        addNotification("error", "You have missed a required field");
    }
});

documentEvent("click", "#addingredient", function(button){
    var lastrow = button.closest(".mealform").querySelector(".ingredientrow:last-child");
    var newrow = lastrow.cloneNode(true);
    newrow.querySelectorAll("input").forEach(function(el){
        el.value = "";
    });
    lastrow.after(newrow);
});

documentEvent("click", ".deleteingredient", function(button){
    button.closest("tr").remove();
});

documentEvent("submit", "#updatemealform", function(formEl, e){
    e.preventDefault();

    var id = formEl.dataset.id;
    var name = formEl.querySelector("input[name='mealname']").value;
    var recipe = formEl.querySelector("textarea[name='recipe']").value;
    var mealtype = formEl.querySelector("select[name='mealtype']").value;

    var ingredients = [];
    var x = 1;
    formEl.querySelectorAll(".ingredientrow").forEach(function(row){
        var ingredient = row.querySelector("input[name='ingredient']").value;
        var quantity = row.querySelector("input[name='quantity']").value;
        var unit = row.querySelector("select[name='unit']").value;
        if (ingredient != "" && quantity > 0 && unit != "") {
            var obj = {ingredient: ingredient, quantity: quantity, unit: unit};
            ingredients.push(obj);
        }
        x++;
    });
    var images = [];
    formEl.querySelectorAll("input[name='image']").forEach(function(image){
        images.push(image.value);
    });
    if (name != "" && ingredients.length > 0) {
        var mealobject = {name: name, mealtype: mealtype, recipe: recipe, ingredients: ingredients, images: images};
        updateMeal(id, mealobject);

        formEl.closest("#updatemeal").classList.remove("enabled");;
    }

    displayMealList();
});

documentEvent("click", ".deletemeal", function(button){
    var id = button.dataset.id;
    deleteMeal(id);
    history.pushState(null, '', '/');
    handleUrl();
});

documentEvent("click", ".deleteimage", function(button){
    button.closest(".image").remove();
});

documentEvent("click", ".notification", function(button){
    button.remove();
});

documentEvent("click", "#generatemealplan", function(button){
    var mealplan = generateMealPlan();
    handleUrl();
});

documentEvent("click", "#exportmeal", function(button){
    var meal = getMeals(button.dataset.id);
    if (meal) {
        var qrcode = new QRCode(document.getElementById("qrcodecontainer"), {
            text: JSON.stringify(meal),
            width: 512,
            height: 512
        });
    }
});

documentEvent("click", "#importmeal", function(button){
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 });
            
    function onScanSuccess(decodedText, decodedResult) {
        // Handle on success condition with the decoded text or result.
        importMeal(decodedText);
        // ...
        html5QrcodeScanner.clear();
        // ^ this will stop the scanner (video feed) and clear the scan area.
    }
    
    html5QrcodeScanner.render(onScanSuccess);
});

function importMeal(qrcodetext) {
    try {
        meal = JSON.parse(qrcodetext);
        if (meal) {
            var name = meal.name;
            var recipe = meal.recipe;
            var ingredients = meal.ingredients;

            if (isString(name) && isString(recipe) && ingredients.constructor === Array) {
                ingredients.forEach(function(ingredient){
                    if (isString(ingredient.ingredient) && isString(ingredient.quantity) && isString(ingredient.unit)) {
                        addMeal(meal);
                        history.pushState(null, '', '/');
                        handleUrl();
                    }
                });
            }
        }
    } catch(e) {
        alert("Failed to import meal");
    }
}

function isString(variable) {
    return (typeof variable === 'string' || variable instanceof String);
}

documentEvent("click", "a", function(button, e){
    e.preventDefault();
    history.pushState(null, '', button.href);
    handleUrl();
});

window.addEventListener('popstate', handleUrl);

handleUrl();