$(document).ready(function(){

	$('#target').prop('disabled', true);

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
		var xmlFile = xml.asText();

		$('#target').prop('disabled', false);


		$( "#target" ).click(function() {

			// Test avec une valeur
			// TODO : TESTER AVEC RIS ORANGIS
			var infosStation = getInfosByLatitudeLongitude(xmlFile,4864729,241893);

			for	(index = 0; index < infosStation.length; index++) {
   				 
   				 console.log(infosStation[index].name);
   				 console.log(infosStation[index].price);

			}
			
		});
	});
});

// obtention 
function getInfosByLatitudeLongitude(datas, latitude, longitude){

	var listOfPetrols = Array();

	// Requete qui cherche la station en fonction de la longitude et de la latitude
	var value = $(datas)
	.find('pdv[latitude^="'+latitude+'"]pdv[longitude^="'+longitude+'"]').find("prix").each(

		function(){

			var name = $(this).attr('nom');
			var price = $(this).attr('valeur');

			listOfPetrols.push( {'name' : name, 'price' : price} );
		}
	);

	return listOfPetrols;
}