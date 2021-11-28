//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const { Console } = require("console");
const Date = require(__dirname+"/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/css',express.static(__dirname + "public/CSS"));
app.use('/images',express.static(__dirname + "public/images"));

var weatherWeekly = [];
const appKey = "d075ee48469b733041d6b9da01b9af90"
const unit = "metric";
const excludes = "minutely,hourly,alert";

mongoose.connect("mongodb+srv://admin-shashini:test123@cluster0.lu5oe.mongodb.net/WeatheruserDB");

const weatheruserSchema = {
    email: String,
    password: String
};

const weatheruser = new mongoose.model("weatheruser",weatheruserSchema);

app.post("/register", function(req, res){

    const email = req.body.username; 
    const password = req.body.password;

    const newUser = new weatheruser({
        email: email,
        password: password
    });
    
    newUser.save().then(item => {
        res.redirect("/Front");
      })
      .catch(err => {
        res.status(400).send("unable to save to database");
      });
});

app.post("/Login", function(req, res){

    const uname= req.body.userName;
    const pword= req.body.userPassword;

    weatheruser.findOne({email : uname}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password === pword){
                    res.redirect("/Front");
                }
            }
        }
    });
});

app.get("/", function (req, res){
    res.render("Home");
});

app.get("/Login", function (req, res){
    res.render("Login");
});

app.get("/register", function (req, res){
    res.render("register");
});

app.get("/logout", function(req,res){
    res.redirect("/");
 });

function splitCoordinate(cordi) {
    const arr = cordi.split(",");
    return arr;
}

app.get("/Front", function(req,res){
    const latti = "6.92";
    const long = "79.86";
    const url = "https://api.openweathermap.org/data/2.5/onecall?lat="+ latti +"&lon="+ long +"&exclude="+ excludes +"&appid="+appKey +"&units="+  unit;


    https.get(url, function(respoense){
        //console.log(respoense);
        console.log(respoense.statusCode);

        respoense.on("data", function(data){
            const weatherData = JSON.parse(data);

            const today = weatherData.daily[0].dt;
            var tday = Date.getDayandDate(today);

            const date = weatherData.daily[0].dt;
            var day = Date.getDate(date);

            const weatherToday = {
                dayName:day, 
                dateNo:tday, 
                city:weatherData.timezone,
                Temperature:parseInt(weatherData.current.temp),
                humidity:weatherData.current.humidity,
                windSpeed:parseInt(weatherData.current.wind_speed*3.6),
                weatherIcon:weatherData.current.weather[0].icon
            };

            for(let i=1; i<7; i++){

                var wDay = Date.getDate(weatherData.daily[i].dt);

                const weatherDay = {
                    weekDay: wDay,
                    weekTemperature: parseInt(weatherData.daily[i].temp.day),
                    weekFeelsLike: parseInt(weatherData.daily[i].feels_like.day),
                    weekIcon: weatherData.daily[i].weather[0].icon
                };
                weatherWeekly.push(weatherDay);
            };
            res.render("Front",{
                today : weatherToday,
                weekly : weatherWeekly
            });
            weatherWeekly.length = 0;
        });
        
    });
});

app.post("/Front", function(req,res){
    const coordi = req.body.coordinates;

    const lat = splitCoordinate(coordi)[0];
    const lon = splitCoordinate(coordi)[1];
      //console.log("coordinates", lat, lon);

    const url = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon +"&exclude="+ excludes +"&appid="+appKey +"&units="+  unit;


    https.get(url, function(respoense){
        //console.log(respoense);
        console.log(respoense.statusCode);

        respoense.on("data", function(data){
            const weatherData = JSON.parse(data);

            const today = weatherData.daily[0].dt;
            var tday = Date.getDayandDate(today);

            const date = weatherData.daily[0].dt;
            var day = Date.getDate(date);

            const weatherToday = {
                dayName:day, 
                dateNo:tday, 
                city:weatherData.timezone,
                Temperature:parseInt(weatherData.current.temp),
                humidity:weatherData.current.humidity,
                windSpeed:parseInt(weatherData.current.wind_speed*3.6),
                weatherIcon:weatherData.current.weather[0].icon
            };

            for(let i=1; i<7; i++){

                var wDay = Date.getDate(weatherData.daily[i].dt);

                const weatherDay = {
                    weekDay: wDay,
                    weekTemperature: parseInt(weatherData.daily[i].temp.day),
                    weekFeelsLike: parseInt(weatherData.daily[i].feels_like.day),
                    weekIcon: weatherData.daily[i].weather[0].icon
                };
                weatherWeekly.push(weatherDay);
                //console.log(weatherWeekly);
            };
            res.render("Front",{
                today : weatherToday,
                weekly : weatherWeekly
            });
            weatherWeekly.length = 0;
        });
        
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function (){
    console.log("server has started Sucessfully.");
});
