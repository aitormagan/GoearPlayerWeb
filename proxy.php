<?

	//Internet Explorer
	header("Pragma: no-cache");
	header("Cache-Control: no-cache, must-revalidate");
	header("Expires: Mon, 12 Jul 2010 03:00:00 GMT");
	
	//Needed for MiArroba to don't modify the response
	header("Content-Type: application/json");

	$url = $_SERVER["HTTP_TARGET_HOST"];
	
	//Get search
	$splitted = explode("?q=",$url);
	$splitted = explode("&p=",$splitted[1]);
	$search = $splitted[0];
	$page = $splitted[1];
	
	//Return JSON
	$url = str_replace(" ","+",$url);	
	$body = file_get_contents($url);
	print($body);

?>
