var map, myPosition, myPositionRadius;
var mapInitialized = false;
var myPosition;

function init()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(showMyPosition, errorHandler, {enableHighAccuracy:true, timeout: 50000, maximumAge: 0});
	}
	else 
	{
		alert("Your Browser does not support GeoLocation.");
	}
}

function showMyPosition(position)
{
	var latLng = L.latLng(position.coords.latitude, position.coords.longitude);
	if (!mapInitialized)
	{
		map = L.map('map',
		{
			center: latLng,
			zoom: 13
		});
		
		L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
			subdomains: ['otile1','otile2','otile3','otile4']
		}).addTo( map );
		
		mapInitialized = true;
		myPosition = L.marker(latLng).addTo(map);
		myPositionRadius = L.circle(latLng, 1000*5, {color: 'red', fillColor: '#f03',fillOpacity: 0.5}).addTo(map);
	}
	else
	{
		myPosition.setLatLng(latLng).update();
		myPositionRadius.setLatLng(latLng).update();
	}
}

function errorHandler(error)
{
	switch(error.code)
	{
        case error.TIMEOUT:
            init();
            break;

        case error.PERMISSION_DENIED:
            alert("Erreur : L'application n'a pas l'autorisation d'utiliser les ressources de geolocalisation.");
            break;

        case error.POSITION_UNAVAILABLE:
            alert("Erreur : La position n'a pas pu être déterminée.");
            break;

        default:
            alert("Erreur "+error.code+" : "+error.message);
            break;
    }
}

$(document).ready(function(){
	init();
});