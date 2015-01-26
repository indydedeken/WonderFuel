var map, myPosition, myPositionRadius;
var mapInitialized = false, routeInitialized = false;
var results = new Array();
var route;
var stations;

function displayRouting(marker)
{
	route = L.Routing.control({
		waypoints: [
			L.latLng(myPosition.getLatLng()),
			marker.latlng
		]
	}).addTo(map);
}

function localizeStations()
{
	//var stations = searchStations(myPosition.getLatLng());
	
	searchStations(myPosition.getLatLng(), function(datas){

		// ICI TU FAIS TON TRAITEMENT
		// RECUPERATION DES DONNEES : variable datas.
		// datas est un tableau � parcourir. Chaque objet du tableau est constitu�e de la mani�re suivante :
		// adresse/ville/latitude/longitude/tableau de Prix (nom/prix)
		// Regardes Firebug pour voir le r�sultat du console.log suivant :
 		console.log(datas); 
	});

	var i;
	results.push(new L.marker([48.6, 2.4]));
	results[0].addTo(map);
	results[0].on('mouseover', displayRouting);
	results[0].bindPopup("Nom de la station service : <NOM> <br/> Gazole : <PRIX> <br/> SP95 : <PRIX>");
	
	/*for (i=0;i<stations.length;i++)
	{
		results.push(new L.marker([stations[i].latitude, stations[i].longitude]).bindPopup("Nom de la station service : <NOM> <br/> Gazole : <PRIX> <br/> SP95 : <PRIX>"));
		results[i].dragging.disable();
		results[i].addTo(map);
		results[i].on('click', function(e)
		{
			alert(e.latlng); // e is an event object (MouseEvent in this case)
		});
	}*/
	
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

		//Test sur la date : si sup�rieur � 19h alors on passe en mode nuit

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
            alert("Erreur : La position n'a pas pu �tre d�termin�e.");
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
	
	// Affichage de la div pr�venant de la recherche de position actuelle et on rend impossible le clique
	// du bouton start tant que la position n'est pas trouv�e
	$(".waitPosition").show();
	$('#start').prop('disabled', true);

	$('#start').on('click', localizeStations);
		
	init();
});