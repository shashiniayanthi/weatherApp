//jshint esversion:6

exports.getDate = function(dt){
    var day = new Date(dt * 1000);
    let date = day.toLocaleString("en-us", { weekday: "long" });
    return date;
};

exports.getDayandDate = function(dt){
    var day = new Date(dt * 1000);
    let date = day.toLocaleString("en-us", { day: 'numeric', month: 'long'});
    return date;
};

