<?
	//Internet Explorer
	header("Pragma: no-cache");
	header("Cache-Control: no-cache, must-revalidate");
	header("Expires: Mon, 12 Jul 2010 03:00:00 GMT");
	header("Content-Type: application/json");
	
	$url = $_SERVER['HTTP_RELAYER_HOST'];
	
	if ($url != "") { 
		$url = str_replace(" ","+",$url);

		$headers = array_change_key_case(get_headers($url, 1),CASE_LOWER);
		$size = $headers['content-length'];
		if (sizeof($size) > 1){
			$size = $size[sizeof($size)-1];
		}
		
		$mb = round($size / (1024*1024),2); 
		$kb = round($size / (1024),2);
		
		print('{ "location" : "' . $headers['location'] . '" , "mb" : "' . $mb . ' MB", "kb" : "' . $kb . ' KB" }');
		//print('{"mb":"<i>No disponible temporalmente</i>"}');
	} else {
		print('{ "error" : "Not valid URL given. URL should be included on relayer_host header" } ');
	}
	
	
?>
