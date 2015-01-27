var map, myPosition, myPositionRadius;
var mapInitialized = false, routeInitialized = false;
var results = new Array();
var route;
var stations;
var kmCircle;
var latLng;

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
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
});

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
	$("#spinner").show();
	searchStations(myPosition.getLatLng(), function(datas){

		// ICI TU FAIS TON TRAITEMENT
		// RECUPERATION DES DONNEES : variable datas.
		// datas est un tableau à parcourir. Chaque objet du tableau est constituée de la manière suivante :
		// adresse/ville/latitude/longitude/tableau de Prix (nom/prix)
		// Regardes Firebug pour voir le résultat du console.log suivant :
		
		var currentHours = new Date().getHours(); 
		var i, j;
		var fuel;
		var popupContent;
 		for (i=0;i<datas.length;i++)
		{
			if ((datas[i].heureOuverture == datas[i].heureFermeture) || (datas[i].heureOuverture <= currentHours && datas[i].heureFermeture >= currentHours))
			{
				popupContent = "<span class='cercleLegende open'></span> ";
			}
			else
			{
				popupContent = "<span class='cercleLegende close'></span> ";
			}
			fuel = datas[i].prix;
			popupContent += (datas[i].ville + " - " + datas[i].adresse + " - " + datas[i].codepostal + "<br>");
			if(datas[i].prix.length != 0)
			{
				popupContent += ("<ul> Prix : ");
				for(j=0;j<fuel.length;j++)
				{
					popupContent += ("<li>" + fuel[j].nom  + ": " + fuel[j].prix + " €/L </li>");
				}
				popupContent += ("</ul><br>");
			}
			else
			{
				popupContent += "prix indisponibles <br>"
			}
			
			if(datas[i].services.length != 0)
			{
				var services = datas[i].services;
				popupContent += ("<ul> Services : ");
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
			
			results.push(new fadeInMarker([datas[i].latitude, datas[i].longitude], {icon: stationIcon}).bindPopup(popupContent));
			results[i].addTo(map);
			results[i].on('mouseover', displayRouting(results[i]));
		}
		
		$("#spinner").hide();
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
	latLng = L.latLng(position.coords.latitude, position.coords.longitude);
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


function displayfilters()
{
	$('#filtre').toggle();
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

	$( "#choiceKmCircle" ).change(function() {
		kmCircle = $( this ).val();
		map.removeLayer(myPositionRadius);
		myPositionRadius = L.circle(latLng, 1000*kmCircle, {color: 'red', fillColor: '#F2F2F2',fillOpacity: 0.5, weight : 2}).addTo(map);
	});
});