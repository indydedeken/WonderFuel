var map, myPosition, myPositionRadius;
var mapInitialized = false, routeInitialized = false;
var results = new Array();
var route;
var stations;
var kmCircle;
var latLng;
var zoom = 13;
var distance = 5;
var listeOfResultsInCircle;
var listeOfResultFiltres = new Array();

var fadeInMarker = L.Marker.extend({
    onAdd: function() {
        this.setOpacity(0);
        L.Marker.prototype.onAdd.apply(this, arguments);
        if (!this._runningFadeIn)
		{
            this.fade(0, 1, null);
        }
    },
    fade: function(from, to, callback)
	{
        var interval = 25,
        msDone = 0,
        ms = 1000,
        id = setInterval(frame, interval),
        currentOpacity = from,
        that = this;

        function frame() {
            that._runningFadeIn = true;
            that.setOpacity(currentOpacity);
            msDone += interval;
            currentOpacity = from + (to - from) * msDone/ms;
            if (msDone >= ms) { // check finish condition
                clearInterval(id);
                that.setOpacity(to);
                that._runningFadeIn = false;
            }
        }
    }
});

var stationIcon = L.icon({
    iconUrl: 'img/station-icon.png',
    iconRetinaUrl: 'img/station-icon.png',
    iconSize: [30, 30],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
});

function displayRouting(marker)
{
	if (!routeInitialized)
	{
		route = L.Routing.control({
			plan: new L.Routing.plan([myPosition.getLatLng(),marker.latlng],{addWaypoints: false, draggableWaypoints: false})
		}).addTo(map);
		routeInitialized = true;
	}
	else
	{
		var waypoints = new Array();
		waypoints.push(myPosition.getLatLng());
		waypoints.push(marker.latlng);
		route.setWaypoints(waypoints);
		route.route();
	}
}

function localizeStations()
{
	$("#spinner").show();
	searchStations(myPosition.getLatLng(), distance, function(datas){
		
		// Recupération des stations dans le cercle
		listeOfResultsInCircle = datas;

		// Méthode qui créer les markers
		createMarkers(listeOfResultsInCircle);

		$("#spinner").hide();
	});
}

function createMarkers(listeStations){

	function displayState(station)
		{
			var currentHours = new Date().getHours();
			var currentMinutes = new Date().getMinutes();
			
			if (station.heureOuverture == station.heureFermeture || (station.heureOuverture.substring(0,1) < currentHours && station.heureFermeture.substring(0,1) > currentHours))
			{
				return "<span class='cercleLegende opened'></span> ";
			}
			else if (station.heureOuverture.substring(0,1) == currentHours && station.heureOuverture.substring(3,4) <= currentMinutes)
			{
				return "<span class='cercleLegende opened'></span> ";
			}
			else if (station.heureFermeture.substring(0,1) == currentHours && station.heureFermeture.substring(3,4) >= currentMinutes)
			{
				return "<span class='cercleLegende opened'></span> ";
			}
			else
			{
				return "<span class='cercleLegende closed'></span> ";
			}
		}
		
		var i, j;
		var fuel;
		var popupContent;

		// On vide la liste
		results.length = 0; 

 		for (i=0;i<listeStations.length;i++)
		{
			fuel = listeStations[i].prix;
			popupContent = ("<address>" + displayState(listeStations[i]) + listeStations[i].ville + " - " + listeStations[i].adresse + " - " + listeStations[i].codepostal + "</address>");
			if(listeStations[i].prix.length != 0)
			{
				popupContent += ("<h6>Prix</h6>");
				popupContent += ("<ul>");
				for(j=0;j<fuel.length;j++)
				{
					popupContent += ("<li>" + fuel[j].nom  + ": " + fuel[j].prix + " €/L </li>");
				}
				popupContent += ("</ul>");
			}
			else
			{
				popupContent += "prix indisponibles <br>"
			}
			
			if(listeStations[i].services.length != 0)
			{
				var services = listeStations[i].services;
				popupContent += ("<h6>Services</h6>");
				popupContent += ("<ul>");
				for(j=0;j<services.length;j++)
				{
					popupContent += ("<li>" + services[j]  + "</li>");
				}
				popupContent += ("</ul>");
			}
			else
			{
				popupContent += "services indisponibles <br>"
			}
			
			popupContent += "<button class='btn btn-primary goBtn'>Go !</button>";
			results.push(new fadeInMarker([listeStations[i].latitude, listeStations[i].longitude], {icon: stationIcon}).bindPopup(popupContent));
			results[i].addTo(map);
		}
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
	latLng = L.latLng(position.coords.latitude, position.coords.longitude);
	if (!mapInitialized)
	{
		map = L.map('map',
		{
			center: latLng,
			zoom: zoom, 
			touchZoom : false,
			scrollWheelZoom : false,
			doubleClickZoom : false,
			boxZoom : false,
			keyboard: false,
			minZoom: 3
		});
		

		var currentdate = new Date(); 

		//Test sur la date : si supérieur à 19h alors on passe en mode nuit

		if(currentdate.getHours() >= 19 || currentdate.getHours() <= 6){

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


function displayfilters()
{
	$('#filtre').toggle();
}

// Fonction qui supprime tous les markers de la map
function clearMarkers(){
	// On reparcours toutes les stations et on met à jour les markers
	for (var i=0; i < results.length; i++){
		map.removeLayer(results[i]);
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

	$('#btnfiltre').on('click',displayfilters);
		
	init();

	// Choix du filtre du rayon des stations
	$( "#choiceKmCircle" ).change(function() {

		$('#choiceGaz option[value="aucun"]').attr("selected",true);
		$('#choiceServices option[value="tout"]').attr("selected",true);

		distance = $( this ).val();
		map.removeLayer(myPositionRadius);
		myPositionRadius = L.circle(latLng, 1000*distance, {color: 'red', fillColor: '#F2F2F2',fillOpacity: 0.5, weight : 2}).addTo(map);
		
		// On set le zoom en fonction du rayon du cercle de recherche
		zoom = (-1/5)* distance  + 14;

		map.setZoom(zoom);

		// On reparcours toutes les stations et on met à jour les markers
		for (var i=0; i < results.length; i++){
			map.removeLayer(results[i]);
		}

		// On rappelle cette méthode pour reparcourir toutes les stations du fichier xml
		localizeStations();
	});

	// Choix du filtre des services
	$( "#choiceServices" ).change(function() {

		// On vide le tableau triés
		listeOfResultFiltres.length = 0;

		var serviceChoisi = $( this ).val();

		if(serviceChoisi == "Tout"){
			createMarkers(listeOfResultsInCircle);
		}else{

			for (var i=0; i < listeOfResultsInCircle.length; i++){

				var station = listeOfResultsInCircle[i];

				// On va parcourir tous les services de chaque station 
				if(station.services.length != 0){
					
					for (var j=0; j < listeOfResultsInCircle[i].services.length; j++) {
						
						if(serviceChoisi == listeOfResultsInCircle[i].services[j]){
							
							// Le service choisi fait parti de la station parcourue, OK on l'ajoute dans le tableau
							listeOfResultFiltres.push(listeOfResultsInCircle[i]);
							break;
						}
					};

				}
			}

			// On commencence par vider les markers de la map
			clearMarkers();

			// On créer les markers sur la map
			createMarkers(listeOfResultFiltres);

		}

	});

	// Choix du filtre des gaz
	$( "#choiceGaz" ).change(function() {

		// On vide le tableau triés
		listeOfResultFiltres.length = 0;

		var gazChoisi = $( this ).val();

		if(gazChoisi == "Tout"){
			createMarkers(listeOfResultsInCircle);
		}else{

			for (var i=0; i < listeOfResultsInCircle.length; i++){

				var station = listeOfResultsInCircle[i];

				// On va parcourir tous les prix de chaque station 
				if(station.prix.length != 0){
					
					for (var j=0; j < listeOfResultsInCircle[i].prix.length; j++) {
						
						if(gazChoisi == listeOfResultsInCircle[i].prix[j].nom){
							
							// Le service choisi fait parti de la station parcourue, OK on l'ajoute dans le tableau
							listeOfResultFiltres.push(listeOfResultsInCircle[i]);
							break;
						}
					};

				}
			}

			// On commencence par vider les markers de la map
			clearMarkers();

			// On créer les markers sur la map
			createMarkers(listeOfResultFiltres);

		}

	});

});