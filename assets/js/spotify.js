// var redirect_uri = "https://makeratplay.github.io/SpotifyWebAPI/"; // change this your value
var redirect_uri = document.URL + "index.html";


var client_id = "";
var client_secret = ""; // In a real app you should not expose your client_secret to the user

var access_token =
  "";
var refresh_token =
  "";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";

// function onPageLoad(){

$.ajax({
    url: './php/token.php',
    dataType: 'json',
    success: function(data) {
       client_id = data.client_id;
       client_secret = data.client_secret;
       access_token = data.access_token;
       refresh_token = data.refresh_token;
    console.log('Done retrieving API credentials');
if (window.location.search.length > 0) {
  handleRedirect();
} else {
  if (access_token == null) {
    // we don't have an access token so present token section
  } else {
    // we have an access token so present device section

    currentlyPlaying();
    setInterval(currentlyPlaying, 3000);
  }
}
  
      // Use the API credentials in your code
    },
    error: function(xhr, status, error) {
      console.log('Error retrieving API credentials');
    }
});


// }

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

function requestAuthorization() {
  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url +=
    "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(client_id + ":" + client_secret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
    }
    onPageLoad();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}
function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.send(body);
  xhr.onload = callback;
}

function currentlyPlaying() {
  callApi("GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse);
  // setInterval(currentlyPlaying(), 5000);
}

function handleCurrentlyPlayingResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    if (data.item != null) {
      // document.getElementById("trackTitle").innerHTML = data.item.name;
      var now_play = data.item.name 

      document.getElementById("now_play_lbl").innerHTML = data.is_playing
        ? "Now Playing"
        : "";
      document.getElementById("now_play").innerHTML = data.is_playing
        ? now_play
        : "";
        document.getElementById("spotify").src = data.is_playing
        ? data.item.album.images[0].url
        : "/assets/img/icons8-spotify-logo-50.png";
        
    }
  } else if (this.status == 204) {
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}
