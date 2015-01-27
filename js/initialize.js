var map, myPosition, myPositionRadius;
var mapInitialized = false, routeInitialized = false;
var results = new Array();
var route;
var stations;

function displayRouting(marker)
{
	if (!routeInitialized)
	{
		route = L.Routing.control({
			waypoints: [
				L.latLng(myPosition.getLatLng()),
				marker.latLng
			]
		}).addTo(map);
		routeInitialized = true;
	}
	else
	{
		var waypoints = new Array();
		waypoints.push(myPosition.getLatLng());
		waypoints.push(marker.latLng);
		route.setWaypoints(waypoints).route();
	}
}

function localizeStations()
{
	searchStations(myPosition.getLatLng(), function(datas){

		// ICI TU FAIS TON TRAITEMENT
		// RECUPERATION DES DONNEES : variable datas.
		// datas est un tableau à parcourir. Chaque objet du tableau est constituée de la manière suivante :
		// adresse/ville/latitude/longitude/tableau de Prix (nom/prix)
		// Regardes Firebug pour voir le résultat du console.log suivant :
		var i, j;
		var fuel;
		var popupContent;
 		for (i=0;i<datas.length;i++)
		{
			fuel = datas[i].prix;
			popupContent = datas[i].adresse + "<br>";
			if(datas[i].prix.length != 0)
			{
				for(j=0;j<fuel.length;j++)
				{
					popupContent += (fuel[j].nom  + ": " + fuel[j].prix + " €/L <br>");
				}
			}
			else
			{
				popupContent += "prix indisponible <br>"
			}
			results.push(new L.marker([datas[i].latitude, datas[i].longitude]).bindPopup(popupContent));
			results[i].addTo(map);
			results[i].on('mouseover', displayRouting(results[i]));
		}
	});
}

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
			zoom: 13, 
			touchZoom : false,
			scrollWheelZoom : false,
			doubleClickZoom : false,
			boxZoom : false,
			keyboard: false,
			minZoom: 3
		});
		

		var currentdate = new Date(); 

		//Test sur la date : si supérieur à 19h alors on passe en mode nuit

		if(currentdate.getHours() > 19 || currentdate.getHours() < 6){

			L.tileLayer.provider('CartoDB.DarkMatter').addTo(map);

		}else{

			L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
				subdomains: ['otile1','otile2','otile3','otile4']
			}).addTo( map );

		}
		
		mapInitialized = true;
		myPosition = L.circleMarker(latLng,{color: 'blue',fillOpacity: 1}).addTo(map);
		myPositionRadius = L.circle(latLng, 1000*5, {color: 'red', fillColor: '#F2F2F2',fillOpacity: 0.5, weight : 2}).addTo(map);
	}
	else
	{
		myPosition.setLatLng(latLng).update();
		myPositionRadius.setLatLng(latLng).update();
	}

	$(".waitPosition").hide();
	$('#start').prop('disabled', false);
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

	$('#startModal').modal({
		keyboard: false,
		show : true
	});
	
	// Affichage de la div prévenant de la recherche de position actuelle et on rend impossible le clique
	// du bouton start tant que la position n'est pas trouvée
	$(".waitPosition").show();
	$('#start').prop('disabled', true);

	$('#start').on('click', localizeStations);
		
	init();
});