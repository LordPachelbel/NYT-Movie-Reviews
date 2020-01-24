<?php

// The API key shouldn't be publicly readable so we'll keep it in a non-public part of the web server.
// This file is just a proxy that adds the API key to the AJAX request.

ini_set('include_path', ini_get('include_path') . ':/home/jordanbr');
require_once('NYT-Movie-Reviews-api-key.inc.php');	// defines $API_KEY_MOVIES

$endpoint = array_pop($_GET);	// remove endpoint from query (assumes endpoint is the final URL parameter)
$url = "{$endpoint}?api-key={$API_KEY_MOVIES}&" . http_build_query($_GET);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
$json = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $json;
