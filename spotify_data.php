<?php


/* 
STEP 0:
REFRESH TOKEN
*/

$client_id = 'your_client_id';
$client_secret = 'your_client_secret';
$redirect_uri = 'http://localhost:3000/spotify_redirect.php'; // your redirect uri in spotify app

$refresh_token_data = json_decode(file_get_contents('refresh.json'), true);
$refresh_token = $refresh_token_data['refresh_token'];

$token_url = 'https://accounts.spotify.com/api/token';
$token_params = [
    'grant_type' => 'refresh_token',
    'refresh_token' => $refresh_token,
    'client_id' => $client_id,
    'client_secret' => $client_secret,
];
$token_response = json_decode(makeRequest($token_url, 'POST', $token_params), true);

if (isset($token_response['access_token'])) {
    file_put_contents('auth.json', json_encode(['access_token' => $token_response['access_token']]));
    // echo 'Saved new generated access token';
} else {
    echo 'Error obtaining new access token.';
}

function makeRequest($url, $method, $params) {
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => $method,
            'content' => http_build_query($params),
        ],
    ];
    $context = stream_context_create($options);
    return file_get_contents($url, false, $context);
}

/*
STEP 0:
ENDE
*/

/*
STEP 1:
DATA.JSON
*/

$endpoints = [
    'user_profile' => 'https://api.spotify.com/v1/me',
    'user_playlists' => 'https://api.spotify.com/v1/me/playlists',
    'top_artists' => 'https://api.spotify.com/v1/me/top/artists',
    'top_tracks' => 'https://api.spotify.com/v1/me/top/tracks',
    'recently_played' => 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    'current_playing' => 'https://api.spotify.com/v1/me/player/currently-playing',
];

function makeApiRequest($url, $headers) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
// load the access token locally from thee file
function getAccessToken() {
    $authFile = 'auth.json';

    if (file_exists($authFile)) {
        $authData = json_decode(file_get_contents($authFile), true);

        if (isset($authData['access_token'])) {
            return $authData['access_token'];
        } else {
            die('Access token not found in auth.json');
        }
    } else {
        die('auth.json not found');
    }
}

$access_token = getAccessToken();

$headers = [
    'Authorization: Bearer ' . $access_token,
];

$data = [];

foreach ($endpoints as $key => $url) {
    $response = makeApiRequest($url, $headers);
    $decodedResponse = json_decode($response, true);

    if (!is_null($decodedResponse) && (is_array($decodedResponse) || is_object($decodedResponse))) {
        removeAvailableMarkets($decodedResponse);

        $data[$key] = $decodedResponse;
    } else {
        // Handle the case where $decodedResponse is null (or not an array/object) as needed
        // For example, you might want to log an error or handle it differently
        // dont have anything lol
    }
}

function removeAvailableMarkets(&$array) {
    if (isset($array['available_markets'])) {
        unset($array['available_markets']);
    }

    foreach ($array as &$value) {
        if (is_array($value) || is_object($value)) {
            removeAvailableMarkets($value);
        }
    }
}

file_put_contents('data.json', json_encode($data));

header('Content-Type: application/json');
echo json_encode($data);
