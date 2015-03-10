// Fonction qui retourne un tableau de stations les plus proches de la position actuelle (rayon de 5 km)
function searchStations(positionActuelle, distance, fonctionDeRetour){

	if(positionActuelle != null){
		
		// Function qui va récupérer le fichier ZIP et le décompresser pour en sortir le XML

		// version PC (avec WAMP) : http://localhost/datas
		// version FirefoxOS : http://donnees.roulez-eco.fr/opendata/jour 
		// version trix firefoxOS (pour tester) : ./datas/prix.zip
		
		JSZipUtils.getBinaryContent('./datas/prix.zip', function(err, data) {

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
				var infosStation = getInfosByLatitudeLongitude(xmlFile, positionActuelle, distance);
				
				//console.log(infosStation);
				fonctionDeRetour(infosStation);
		});

	}
}

// obtention d'une liste de prix/adresse/ville des stations les plus proches (dans un rayon de 10 km)
function getInfosByLatitudeLongitude(datas, positionActuelle, distance){

	 var listOfStations = Array();
	 var result = null;

	var value = $(datas).find('pdv').each(

			function(){

			 	 // get latitude/longitude de chaque entrée
				 var lat = $(this).attr('latitude') / 100000;
				 var long = $(this).attr('longitude') / 100000;

				 // Et on recupère la distance entre la position actuelle et la station à vol d'oiseau
				 result = positionActuelle.distanceTo([lat, long])/1000;

				 // Moins de 10km ? OK on ajoute la station dans la liste
				 if( result <= distance){

				 	// Récupération de la date et fin d'ouverture
				 	var dateOuverture = $(this).find('ouverture').attr('debut');
				 	var dateFermeture =  $(this).find('ouverture').attr('fin');

				 	// Code postal
				 	var cp = $(this).attr("cp");

				 	// Récupération des services
				 	listOfServices = Array();

				 	$(this).find("service").each(
				 		function(){
				 			listOfServices.push($(this).text());
				 		}
				 	);

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
				 	var ville = $(this).find("ville").text();
				 	var adresse = $(this).find("adresse").text();

				 	listOfStations.push( 
				 		{'latitude' : lat, 'longitude' : long, 'ville' : ville, 'codepostal' : cp, 'adresse' : adresse, 
				 		'prix' : listOfPetrols, 'services' : listOfServices, 'heureOuverture' : dateOuverture, 
				 		'heureFermeture' : dateFermeture} )

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