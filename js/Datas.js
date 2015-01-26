// Fonction qui retourne un tableau de stations les plus proches de la position actuelle (rayon de 5 km)
function searchStations(positionActuelle){

	// Function qui va récupérer le fichier ZIP et le décompresser pour en sortir le XML
	JSZipUtils.getBinaryContent('http://localhost/datas', function(err, data) {

		if(err) {
			throw err; 
		}	

		// Obtention du zip 
		var zip = new JSZip(data);

		// Liste des fichiers du zip (il n'y en a qu'un)
		var files = zip.files;

		// Obtention de la seule clé de la liste
		var filename = null;
		for(var key in files){
			filename = key;
			break;
		}

		// Get la seule entrée du zip : le fichier XML
		var xml = zip.file(filename);

		// Et on récupère son contenu
		var xmlFile = xml.asBinary();

			// On récupère la liste des stations
			var infosStation = getInfosByLatitudeLongitude(xmlFile, positionActuelle);
			
			console.log(infosStation);
	});
}

// obtention d'une liste de prix/adresse/ville des stations les plus proches (dans un rayon de 10 km)
function getInfosByLatitudeLongitude(datas, positionActuelle){

	 var listOfStations = Array();
	 var result = null;

	var value = $(datas).find('pdv').each(

			function(){

				 // get latitude/longitude de chaque entrée
				 var lat = $(this).attr('latitude');
				 var long = $(this).attr('longitude');

				 // Et on recupère la distance entre la position actuelle et la station à vol d'oiseau
				 result = positionActuelle.distanceTo([lat/100000, long/100000])/1000;

				 // Moins de 10km ? OK on ajoute la station dans la liste
				 if( result <= 5){

				 	// Initialisation de la liste des prix 
				 	listOfPetrols = Array();

				 	// Parcours des prix
				 	$(this).find("prix").each(
				 		function(){

				 			// Ajout de chaque Produit dans la liste
				 			listOfPetrols.push( {'nom' : $(this).attr('nom'), 'prix' : $(this).attr('valeur')/1000} );

				 		}
				 	);

				 	// Récupération de la ville et de l'adresse
				 	var ville = $(this).find("adresse").text();
				 	var adresse = $(this).find("ville").text();

				 	listOfStations.push( 
				 		{'latitude' : lat, 'longitude' : long, 'ville' : ville, 'adresse' : adresse, 'prix' : listOfPetrols} )

				 } 
			}
		);

	return listOfStations;
}

	// Requete qui cherche la station en fonction de la longitude et de la latitude
/*	var value = $(datas)
	.find('pdv[latitude^="'+latitude+'"]pdv[longitude^="'+longitude+'"]').find("prix").each(

		function(){

			var name = $(this).attr('nom');
			var price = $(this).attr('valeur');

			listOfPetrols.push( {'name' : name, 'price' : price} );
		}
	);

	return listOfPetrols;
}*/