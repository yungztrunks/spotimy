<?php
$client_id = 'your_client_id';
$client_secret = 'your_client_secret';
$redirect_uri = 'http://localhost:3000/spotify_redirect.php'; // your redirect uri in spotify app

$scope = 'user-read-private user-read-email user-read-recently-played user-read-playback-state user-read-playback-position user-top-read'; //Add scopes

$authorize_url = 'https://accounts.spotify.com/authorize';
$authorize_params = [
    'client_id' => $client_id,
    'response_type' => 'code',
    'redirect_uri' => $redirect_uri,
    'scope' => $scope,
    'state' => bin2hex(random_bytes(16)),
];
$authorize_url .= '?' . http_build_query($authorize_params);

header('Location: ' . $authorize_url);
exit;