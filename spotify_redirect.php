<?php

$client_id = 'your_client_id';
$client_secret = 'your_client_secret';
$redirect_uri = 'http://localhost:3000/spotify_redirect.php'; // your redirect uri in spotify app

$code = $_GET['code'];

$token_url = 'https://accounts.spotify.com/api/token';
$token_params = [
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $redirect_uri,
    'client_id' => $client_id,
    'client_secret' => $client_secret,
];
$token_response = json_decode(makeRequest($token_url, 'POST', $token_params), true);

if (isset($token_response['access_token'])) {
    file_put_contents('auth.json', json_encode(['access_token' => $token_response['access_token']]));
    file_put_contents('refresh.json', json_encode(['refresh_token' => $token_response['refresh_token']]));
    
    echo 'Authorization successful. Tokens saved.';
} else {
    echo 'Error obtaining access token.';
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