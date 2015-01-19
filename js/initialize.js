function init()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.watchPosition(show, errorHandler, {enableHighAccuracy:true, timeout: 20000, maximumAge: 0});
	}
	else 
	{
		alert("Your Browser does not support GeoLocation.");
	}
}

function show(position)
{
	var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	
	var mapOptions = {
		zoom: 15,
		center: myLatLng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	var $content = $("#map div:jqmData(role=content)");
	$content.height(screen.height);
	
	var map = new google.maps.Map($content[0], mapOptions);
	
	$.mobile.changePage($("#map"));

	var myPositionMarker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		icon: 'img/geoloc.png',
		animation : google.maps.Animation.DROP
	});

	  var widgetDiv = document.getElementById('text');
 	 map.controls[google.maps.ControlPosition.TOP_LEFT].push(widgetDiv);

}

function errorHandler(error)
{
	alert("Error while retrieving current position. Error code: " + error.code + ",Message: " + error.message);
}

$(document).ready(function(){
	init();
});