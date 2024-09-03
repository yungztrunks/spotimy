<?php

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
    echo 'New access token generated and saved.';
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