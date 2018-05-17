var API_KEY = "d703871f861842b79c60988ccf3b17ec";

var STORAGE_ID = 'weatherChat';


//loading gif loader during city search
var $body = $('body');
$(document).on({
    ajaxStart: function () { $body.addClass("loading"); },
    ajaxStop: function () { $body.removeClass("loading"); }
});


function weatherChatApp() {
    var cities = [];
    var cityObjectID = 1;
    var commentID = 1;


    //fetch a city JSON, add it to the array and display all cities
    var fetchCity = function (city) {
        $.ajax({
            method: "GET",
            url: 'http://api.openweathermap.org/data/2.5/weather?q=' + city + "&units=metric" + "&APPID=" + API_KEY,
            success: function (data) {
                console.log("in fetch");
                _addCity(data);
                var sortChoice =$('.dropdown-btn').text().slice(8);
                sortEntries(sortChoice);
                displayAllCities();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
                errorCity();
            }
        });
    };

//find city array by id
    function _findCityByID(id) {
        var index = cities.map(function (city) { return city.objectID; }).indexOf(id);
        return index;
    }

    //find the icon according to id in city JSON
    function _findIconClass(id) {
        var first_digit = id.toString()[0];
        var icon_class;
        switch (first_digit) {
            case "2":
                icon_class = "wi wi-thunderstorm";
                break;
            case "3":
                icon_class = "wi wi-sprinkle"
                break;
            case "5":
                icon_class = "wi wi-showers"
                break;
            case "6":
                icon_class = "wi wi-snow"
                break;
            case "7":
                icon_class = "wi wi-earthquake"
                break;
            case "8":
                if (id == 800)
                    icon_class = "wi wi-day-sunny";
                else
                    icon_class = "wi wi-cloudy";
                break;

            default: icon_class = "wi wi-day-sunny";

        }
        return icon_class;
    }


//add the city to the top of the array
    function _addCity(city) {
      city.date = new Date();
        city.objectID = cityObjectID++;
        var icon_class = _findIconClass(city.weather[0].id);
        city.weather_icon = icon_class;
        city.comments = [];
        cities.unshift(city);
        saveToLocalStorage();
        console.log(city);
    }

    function displayAllCities() {
        console.log(cities);
        $display_cities = $('.display-cities');
        $display_cities.empty();
        for (var city of cities) {
            console.log(city.date);
            $city = $("<div class=\"row city-wrapper\" data-id=" + city.objectID + "></div>");
            $cityContainer = $("<div class=\"col-xs-8  mx-auto city-container rounded\"><button class=\"btn remove-btn\"><i class=\"fas fa-times\"></i> </button></div>");
            $cityContainer.append("<div class=\"weather-info\">" +
                "<h3 class=\"city-name\">" + city.name + ", " + city.sys.country + "</h3>" +
                "<p class=\"date-time\"><em>at " + city.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " on " + city.date.toLocaleDateString() + "</em></p>" +
                "<h1 class=\"temperature\">" + city.main.temp + "&#8451;</h1> " +
                "<p class=\"description\"><i class=\"weather-icon " + city.weather_icon + "\"></i>" + city.weather[0].description + "</p> </div>" +
                "<div class=\"comment-section  rounded\">" +
                "<h5>Comments:</h5>" +
                "<div class=\"comments-container\"></div>" +
                "<form class=\"add-comment-form\">" +
                "<div class=\"input-group\">" +
                "<textarea type=\"text\" class=\"comment-input  form-control\" placeholder=\"Comment about the weather...\"></textarea>" +
                "<span><button type=\"button\" class=\" form-control add-comment-btn\">Comment</button></span>" +
                "</div></form></div> </div> </div>");
            $city.append($cityContainer);
            $display_cities.append($city);
            displayComments(city, $city);
        }


    }


    //remove city from the array
    function removeCity($city) {
        var index = _findCityByID($city.data('id'));
        cities.splice(index, 1);
        saveToLocalStorage();
    }


    //add a comment to the array to a particular
    function addComment(comment, $city) {
        var index = _findCityByID($city.data('id'));
        var city = cities[index];
        cities[index].comments.push({ comment: comment, id: commentID++ })
        saveToLocalStorage();
        displayComments(city, $city);
    }


    //display the comments 
    function displayComments(city, $city) {
        var $comments_container = $city.find(".comments-container");
        $comments_container.empty();
        for (var comment of city.comments) {
            $comments_container.append("<p class=\"comment rounded\" data-id=\"" + comment.id + "\">" + comment.comment + "</p>");
        }

    }

    var saveToLocalStorage = function () {
        localStorage.setItem(STORAGE_ID, JSON.stringify(cities));
    }


    var getFromLocalStorage = function () {
        cities = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
        for(city of cities){
            city.date = new Date(city.date);
        }
    
    }


    //display the red div error when invalid city input
    var errorCity = function(){
        $('.search-input').addClass('red-border');
        $('.search-btn').addClass('red-border');
        $('.error-text').toggleClass('hidden','show');
       
    }

    var sortEntries = function(choice){
        switch(choice){
            case "Date": 
            cities.sort(function(a,b){
                console.log(a.date.dateString);
                var c = new Date(a.date);
                var d = new Date(b.date);

                return d-c;
                });
            break;
            case "Temperature":
            cities.sort(function(a,b){
                return a.main.temp - b.main.temp;
                });
                break;
            case "City":
            cities.sort(function(a, b){
                if(a.name < b.name) return -1;
                if(a.name> b.name) return 1;
                return 0;
            })
                break;
        }

        displayAllCities();
    }

    return {
        fetchCity: fetchCity,
        removeCity: removeCity,
        addComment: addComment,
        displayAllCities: displayAllCities,
        getFromLocalStorage: getFromLocalStorage,
        errorCity, errorCity,
        sortEntries, sortEntries

    };
}


var app = weatherChatApp();
app.getFromLocalStorage();
app.displayAllCities();


$('.search-btn').on('click', function (event) {
    event.preventDefault();
    console.log("clicked");
    var city = $('.search-input').val();
    if (city == "" || city == " ") {
        app.errorCity();
        

    }
    else{
        console.log("before fetch");
        app.fetchCity(city);
    }

});


//remove the error classes when starting to type in the input box
$('.search-input').on('keypress', function() {
    if($('.search-input').hasClass('red-border')){
            $('.search-input').removeClass('red-border');
            $('.search-btn').removeClass('red-border');
            $('.error-text').toggleClass('hidden','show');

    }
  });
 

  //clicking on the remove button 
$('.display-cities').on('click', '.remove-btn', function () {
    var $city = $(this).closest('.city-wrapper');
    app.removeCity($city);
    app.displayAllCities();
});


//clicking in the add-comment-btn
$('.display-cities').on('click', '.add-comment-btn', function () {
    var $city = $(this).closest('.city-wrapper');
    var comment = $city.find('.comment-input').val();
    app.addComment(comment, $city);

});


$('.sort-by-dropdown').on('click', '.dropdown-item', function(){
    var $current_item = $(this);
    var choice = $current_item.text();
    $current_item.closest('.dropdown').find('.dropdown-btn').html("Sort by "+  choice );
    app.sortEntries(choice);

});






