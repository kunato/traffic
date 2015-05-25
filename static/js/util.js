function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function removeFromArray(array, val) {
    var i = array.indexOf(val);
    return i > -1 ? array.splice(i, 1) : [];
}

function getColorFromTraffic(speed, count) {
    if (speed == 0) return '#393C3D'
    else if (speed < 10) return '#E65F39'
    else if (speed < 20) return '#EBDF60'
    else return '#ABE65E'
}

function convertToPercent(value, max) {
    return value / max;
}

function pInt(value) {
    if (value.indexOf('px') > -1) {
        var i = value.split('px')
    } else {
        var i = value;
    }
    return i[0];
}

function calcDistance(latLng1, latLng2) {
    console.log(latLng1,latLng2)
    var i = Math.sqrt((Math.pow((latLng1.lng() - latLng2.lng()), 2) + (Math.pow((latLng1.lat() - latLng2.lat()), 2))))
    return i
}

function rad(x) {
    return x * Math.PI / 180;
};

function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};