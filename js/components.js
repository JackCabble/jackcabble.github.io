function mealForm(id = false) {

    var name = "";
    var recipe = "";
    var ingredients = [{ingredient: "", quantity: "", unit: ""}];
    var images = [];
    var formid = "addmeal";
    var buttontext = "Add meal";
    var mealtype = "";

    if (id !== false) {
        var meal = getMeals(id);
        if (meal) {
            name = meal.name;
            recipe = meal.recipe;
            formid = "updatemeal";
            mealtype = meal.mealtype;

            if (meal.ingredients.length > 0) {
                ingredients = meal.ingredients;
            }

            if (meal.images.length > 0) {
                images = meal.images;
            }
            buttontext = "Update meal";
        }
    }

    var ingredientHtml = '';
    ingredients.forEach(function(ingredient){
        ingredientHtml += ingredientRow(ingredient.ingredient, ingredient.quantity, ingredient.unit);
    });

    var imageHtml = '';
    images.forEach(function(image){
        imageHtml += mealImage(image);
    });

    var html = '<form id="'+formid+'" class="mealform" method="post">';
    html += '<input id="mealid" type="hidden" name="mealid" value="'+id+'">';
    html += `
            <label>Name*:<input id="newmealname" type="text" name="name" value="{{name}}"></label>
            <label>Meal type:<br/>
    `;

    html += '<select id="mealtype" name="mealtype">';
    html += '<option value="breakfast" '+(mealtype == 'breakfast' ? 'selected' : '')+'>Breakfast</option>';
    html += '<option value="lunch" '+(mealtype == 'lunch' ? 'selected' : '')+'>Lunch</option>';
    html += '<option value="dinner" '+(mealtype == 'dinner' ? 'selected' : '')+'>Dinner</option>';
    html += '<option value="snack" '+(mealtype == 'snack' ? 'selected' : '')+'>Snack</option>';
    html += '</select>';

    html += `
            </label>
            <label>Recipe:<textarea id="newmealrecipe" name="recipe">{{recipe}}</textarea></label>
            <table>
                <thead>
                    <tr>
                        <td width="60%">Ingredient*</td>
                        <td width="10%">Quantity</td>
                        <td width="20%">Unit</td>
                        <td width="10%"></td>
                    </tr>
                </thead>
                <tbody>
                    {{ingredients}}
                </tbody>
            </table>
            <button type="button" id="addingredient" class="secondarybutton">Add ingredient</button>
    `;

    html += '<br/><input type="submit" value="'+buttontext+'" class="primarybutton">';
    html += '</form>';

    return updatePlaceholders(html, {
        name: name,
        recipe: recipe,
        ingredients: ingredientHtml,
        images: imageHtml
    });
}

function ingredientRow(ingredient, quantity, unit) {
    var html = '<tr class="ingredientrow">';
    html += '<td><input type="text" name="ingredient" value="'+ingredient+'"></td>';
    html += '<td><input type="number" name="quantity" value="'+quantity+'"></td>';
    html += '<td><select name="unit">';
    html += '<option value="unit" '+(unit == "unit" ? 'selected' : '')+'>unit(s)</option>';
    html += '<optgroup label="Weight"></optgroup>';
    html += '<option value="g" '+(unit == "g" ? 'selected' : '')+'>g</option>';
    html += '<optgroup label="Liquid"></optgroup>';
    html += '<option value="ml" '+(unit == "ml" ? 'selected' : '')+'>ml</option>';
    html += `   
                </select>
            </td>
            <td align="right">
                <button type="button" class="deleteingredient"></button>
            </td>
        </tr>
    `;

    return html;
}

function mealImage(image) {
    var html = '<div class="image">';
    html += '<img src="'+image+'">';
    html += '<button type="button" class="deleteimage"></button>';
    html += '<input type="hidden" name="image" value="'+image+'">';
    html += '</div>';

    return html;
}

function displayMealList() {
    var meals = getMeals();

    var html = '<h1>Meal List</h1><a href="/addmeal" type="button" class="primarybutton">Add meal</a>';

    html += '<div id="innermeallist">';

    var template = `
        <div class="meal">
            <div class="innermeal">
                <div class="imagecontainer" style="background-image: url('{{image}}')">
                    <a class="editmeal" href="{{updateurl}}"></a>
                    <button type="button" data-id="{{id}}" class="deletemeal"></button>
                </div>
                <a class="openmeal" href="/meal?id={{id}}">{{name}}</a>
            </div>
        </div>
    `;

    meals.forEach(function(meal, index){
        var ingredientHtml = '';
        meal.ingredients.forEach(function(ingredient){
            ingredientHtml += "<li>"+ingredient.quantity+" "+ingredient.unit+" x "+ingredient.ingredient+"</li>";
        });
        var imagesrc = '/images/unknownimage.jpg';
        if (meal.images && meal.images.length > 0) {
            imagesrc = meal.images[0];
        }
        var mealEl = updatePlaceholders(template, {
            name: meal.name,
            recipe: meal.recipe,
            ingredients: ingredientHtml,
            image: imagesrc,
            id: index,
            updateurl: "/updatemeal?id="+index
        });

        html += mealEl;
    });

    html += '</div>';

    html += '<button type="button" id="importmeal">Import Meal</button><div style="width: 500px" id="reader"></div>';

    return html;
}

function displayAddMeal() {
    var html = '<a class="iconlink backlink" href="/">Back</a>';
    html += mealForm(true);

    return html;
}

function displayUpdateMeal(id) {
    var html = '<a class="iconlink backlink" href="/">Back</a>';
    html += mealForm(id);

    return html;
}

function displayOpenMeal(meal, id) {

    var template = `
        <a class="iconlink backlink" href="/">Back</a>
        <div class="mealimages xscroller">
            {{images}}
        </div>
        <h1>{{name}}</h1>
        <h4>Meal type: {{mealtype}}</h4>
        <ul>
            {{ingredients}}
        </ul>
        <p id="recipe">{{recipe}}</p>
        <button data-id="{{id}}" type="button" id="exportmeal" class="primarybutton">Export meal</button>
        <div id="qrcodecontainer"></div>
    `;

    var ingredientHtml = '';
    meal.ingredients.forEach(function(ingredient){
        ingredientHtml += '<li>'+ingredient.quantity+' '+ingredient.unit+' '+ingredient.ingredient+'</li>';
    });
    if (meal.images.length > 0) {
        var imageHtml = '';
        meal.images.forEach(function(image){
            imageHtml += '<img src="'+image+'">';
        });
    } else {
        var imageHtml = '<img src="/images/unknownimage.jpg">';
    }

    return updatePlaceholders(template, {
        id: id,
        name: meal.name,
        recipe: nl2br(meal.recipe),
        ingredients: ingredientHtml,
        images: imageHtml,
        mealtype: meal.mealtype
    });
}

function displayMealPlan() {
    var html = '<h1>Meal Plan</h1><button type="button" id="generatemealplan" class="primarybutton">Generate meal plan</button>';

    mealplan = getMealPlan();

    if (mealplan.length > 0) {
        mealplan.forEach(function(week, index){
            html += '<h2 class="weeklabel">Week '+(index + 1)+'</h2>';
            var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            var meals = ["breakfast", "lunch", "dinner", "snack"];
    
            days.forEach(function(day){
                html += '<h3 class="daylabel">'+day+'</h3>';
                html += '<div class="dayplan">';
                meals.forEach(function(mealtype){
                    if (week[day][mealtype]) {
                        var mealtemplate = `
                            <div class="mealtypeshowcase">
                                <p class="meallabel">{{mealtype}}:</p>
                                <div class="mealshowcase">
                                    <img src="{{image}}">
                                    <p class="mealname">{{name}}</p>
                                </div>
                            </div>
                        `;
                        var imagesrc = '/images/unknownimage.jpg';
                        if (week[day][mealtype].images && week[day][mealtype].images.length > 0) {
                            imagesrc = week[day][mealtype].images[0];
                        }
                        html += updatePlaceholders(mealtemplate, {
                            name: week[day][mealtype].name,
                            image: imagesrc,
                            mealtype: mealtype
                        });
                    } else {
                        html += '<div class="mealtypeshowcase"><p class="meallabel">'+mealtype+':</p><p>No meals found</p></div>';
                    }
                });
                html += '</div>';
            });
        });
    } else {
        html += '<p>No meal plan generated</p>';
    }

    return html;
}

function generateMealPlan(weekstocreate = 1) {
    var weeks = [];
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    var breakfasts = [];
    var lunches = [];
    var dinners = [];
    var snacks = [];

    getMeals().forEach(function(meal){
        if (meal.mealtype == 'breakfast') {
            breakfasts.push(meal);
        } else if (meal.mealtype == 'lunch') {
            lunches.push(meal);
        } else if (meal.mealtype == 'dinner') {
            dinners.push(meal);
        } else if (meal.mealtype == 'snack') {
            snacks.push(meal);
        }
    });

    for (var i = 0; i< weekstocreate; i++) {
        var week = {};
        days.forEach(function(day){
            week[day] = {
                breakfast: getRandomMeal(breakfasts),
                lunch: getRandomMeal(lunches),
                dinner: getRandomMeal(dinners),
                snack: getRandomMeal(snacks)
            };
        });

        weeks[i] = week;
    }

    localStorage.setItem("mealplan", JSON.stringify(weeks));

    return weeks;
}

function getRandomMeal(meals) {
    var meal = meals[Math.floor(Math.random()*meals.length)];

    if (!meal) {
        meal = false;
    }

    return meal;
}