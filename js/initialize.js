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
var gazChoisi;

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
    iconUrl: 'img/other/station-icon.png',
    iconRetinaUrl: 'img/other/station-icon-2x.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, 0]
});

var firstIcon = L.icon({
    iconUrl: 'img/first/first-icon.png',
    iconRetinaUrl: 'img/first/first-icon.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, 0]
});

function displayRouting(ind)
{
	map.closePopup();
	if (!routeInitialized)
	{
		route = L.Routing.control({
			plan: new L.Routing.plan([myPosition.getLatLng(),results[ind].getLatLng()],{addWaypoints: false, draggableWaypoints: false}),
			language: 'fr'
		}).addTo(map);
		routeInitialized = true;
	}
	else
	{
		var waypoints = new Array();
		waypoints.push(myPosition.getLatLng());
		waypoints.push(results[ind].getLatLng());
		route.setWaypoints(waypoints);
		route.route();
	}
	$("#routeContainer").show();
}

function mapOnClick()
{
	if (mapInitialized)
	{
		$('#filtre').hide();
		map.closePopup();
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

function makeRoutingCallback(ind)
{
  return function(){ displayRouting(ind);};
}

function createMarkers(listeStations)
{
	function displayState(station, ind)
	{
		var currentHours = new Date().getHours();
		if (currentHours < 10) 
		{
			currentHours = "0" + currentHours;
		}
		currentHours =  currentHours + ":" + new Date().getMinutes()
		
		if (station.heureOuverture && station.heureFermeture)
		{
			// 24H/24
			if (station.heureOuverture == station.heureFermeture)
			{
				return "<span class='cercleLegende badge opened'>"+ind+"</span> ";
			}
			else if (station.heureOuverture <= currentHours && station.heureFermeture >= currentHours) // station ouverte
			{
				return "<span class='cercleLegende badge opened'>"+ind+"</span> ";
			}
			else // station fermée
			{
				return "<span class='cercleLegende badge closed'>"+ind+"</span> ";
			}
		}
		else
		{
			return "<span class='cercleLegende badge'>"+ind+"</span> ";
		}
	}
	
	var i, j;
	var fuel;
	var markerIcon;

	// On vide la liste
	results.length = 0; 

 	for (i=0;i<listeStations.length;i++)
	{
		var popupContent = $('#popupTemplate').clone();
		fuel = listeStations[i].prix;
		popupContent.find("address b").html(displayState(listeStations[i], i+1) + listeStations[i].ville + " - " + listeStations[i].adresse + " - " + listeStations[i].codepostal);
		if(listeStations[i].prix.length != 0)
		{
			popupContent.find(".list-group .listPrice .badge").text(listeStations[i].prix.length);
			for(j=0;j<fuel.length;j++)
			{
				if (fuel[j].nom != undefined)
				{
					popupContent.find(".list-group .listPrice ul").append("<li>" + fuel[j].nom  + ": " + fuel[j].prix + " €/L </li>");
				}
				else
				{
					popupContent.find(".list-group .listPrice ul").append("<li> Prix indisponible </li>");
				}
			}
		}
		else
		{
			popupContent.find(".list-group .listPrice").append("prix indisponibles <br>");
		}
			
		if(listeStations[i].services.length != 0)
		{
			var services = listeStations[i].services;
			popupContent.find(".list-group .listServices .badge").text(listeStations[i].services.length);
			for(j=0;j<services.length;j++)
			{
				popupContent.find(".list-group .listServices ul").append("<li>" + services[j]  + "</li>");
			}
		}
		else
		{
			popupContent.find(".list-group .listServices").append("</div>services indisponibles <br>");
		}
		
		if (i <= 2)
		{
			markerIcon = firstIcon;
		}
		else
		{
			markerIcon = stationIcon;
		}
		
		popupContent.find(".goBtn").on("click", makeRoutingCallback(i));
		
		results.push(new fadeInMarker([listeStations[i].latitude, listeStations[i].longitude], {icon: markerIcon}).bindPopup(popupContent.get(0)));
		results[i].addTo(map);
	}
}

function init()
{
	if (navigator.geolocation)
	{
		window.navigator.geolocation.watchPosition(showMyPosition, errorHandler, {enableHighAccuracy: true, timeout: 5000,maximumAge: 20000});
	}
	else 
	{
		$('#messageErreur').html("Votre navigateur ne supporte pas la géolocation") ;
		$('#messageErreur').css("display", "block");
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
			doubleClickZoom : false,
			boxZoom : false,
			keyboard: false,
			minZoom: 3
		});
		

		var currentdate = new Date(); 

		//Test sur la date : si supérieur ou égal à 19h alors on passe en mode nuit
		if(currentdate.getHours() >= 19 || currentdate.getHours() <= 6){

			L.tileLayer.provider('CartoDB.DarkMatter').addTo(map);

		}
		else
		{
			L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png',{subdomains: ['otile1','otile2','otile3','otile4']}).addTo( map );
		}
		
		mapInitialized = true;
		myPosition = L.circleMarker(latLng,{color: 'blue',fillOpacity: 1}).addTo(map);
		myPositionRadius = L.circle(latLng, 1000*5, {color: 'red', fillColor: '#F2F2F2',fillOpacity: 0.5, weight : 2}).addTo(map);
		map.on('click', function(e)
		{
			mapOnClick();
		});
		
		window.setInterval(
			function ()
			{
				init();
			}
			, 60000 //check every minutes
		);
	}
	else
	{
		if (myPosition && myPositionRadius)
		{
			myPosition.setLatLng(latLng).update();
			myPositionRadius.setLatLng(latLng).update();
			if (routeInitialized)
			{
				var waypoints = route.getWaypoints();
				waypoints[0] = latLng;
				route.setWaypoints(waypoints);
				route.route();
			}
		}
	}

	$(".waitPosition").hide();
	$('#start').prop('disabled', false);
}

function errorHandler(error)
{
	if(!mapInitialized)
	{
		switch(error.code)
		{
			case error.TIMEOUT:
				init();
				break;

			case error.PERMISSION_DENIED:
				$('#messageErreur').html("Erreur : L'application n'a pas l'autorisation d'utiliser les ressources de geolocalisation.") ;
				$('#messageErreur').css("display", "block");
				break;

			case error.POSITION_UNAVAILABLE:
				$('#messageErreur').html("Erreur : La position n'a pas pu être déterminée.") ;
				$('#messageErreur').css("display", "block");
				break;

			default:
				$('#messageErreur').html("Erreur "+error.code+" : "+error.message) ;
				$('#messageErreur').css("display", "block");
				break;
		}
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

function showRoutePanel()
{
	$(".leaflet-routing-container").toggle();
	$('#filtre').hide();
	map.closePopup();
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

	$('#btnCentrage').on('click',centrage);
	
	$('#btnRoute').on("click", showRoutePanel);
		
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

		$('#choiceGaz').prop('selectedIndex', 0);

		// on clean la map
		clearMarkers();

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

			// On créer les markers sur la map
			createMarkers(listeOfResultFiltres);

		}

	});

	// Choix du filtre des gaz
	$( "#choiceGaz" ).change(function() {

		$('#choiceServices').prop('selectedIndex', 0);

		// on clean la map
		clearMarkers();

		// On vide le tableau triés
		listeOfResultFiltres.length = 0;

		gazChoisi = $( this ).val();

		if(gazChoisi == "aucun"){
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

			// on trie la liste par ordre décroissant des prix du gaz sélectionné
			listeOfResultFiltres.sort(
				function(a,b){ 

					var prixA, prixB;

					for (var i = 0; i < a.prix.length; i++) {

						if(gazChoisi == a.prix[i].nom){
							prixA = a.prix[i].prix;
						}

					};

					for (var j = 0; j < b.prix.length; j++) {
						
						if(gazChoisi == b.prix[j].nom){
							prixB = b.prix[j].prix;
						}

					};

					return parseFloat(prixA) - parseFloat(prixB); 
				} 
			);

			// On créer les markers sur la map
			createMarkers(listeOfResultFiltres);

		}

	});


	function centrage()
	{
		map.setView(myPosition.getLatLng());
		map.closePopup();
	}
});