from datetime import timedelta

from decouple import config
from django.utils import timezone
from requests import post, put, get
from spotify.models import SpotifyToken

BASE_URL = 'https://api.spotify.com/v1/me/'


def get_user_tokens(session_key):
    user_tokens = SpotifyToken.objects.filter(user=session_key)

    if user_tokens.exists():
        return user_tokens.first()
    else:
        return None


def upsert_user_tokens(session_key, access_token, token_type, expires_in, refresh_token):
    token = get_user_tokens(session_key)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.expires_in = expires_in
        token.token_type = token_type
        token.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        token = SpotifyToken(user=session_key, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        token.save()


def is_authenticated(session_key):
    token = get_user_tokens(session_key)

    if token:
        if token.expires_in <= timezone.now():
            refresh_token(session_key)

        return {'status': True, 'accessToken': token.access_token}
    return {'status': False}


def refresh_token(session_key):
    _refresh_token = get_user_tokens(session_key).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': get_user_tokens(session_key).refresh_token,
        'client_id': config('CLIENT_ID'),
        'client_secret': config('CLIENT_SECRET')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    upsert_user_tokens(session_key, access_token, token_type, expires_in, _refresh_token)


def execute_api_request(session_key, endpoint, post_=False, put_=False):
    token = get_user_tokens(session_key)
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)

    if put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)

    try:
        return response.json()
    except:
        return {'error': 'Unable to process request'}


def play_pause_song(session_key, play=True):
    endpoint = 'player/' + ('play' if play else 'pause')

    return execute_api_request(session_key, endpoint, put_=True)


def skip_song(session_key):
    return execute_api_request(session_key, 'player/next', post_=True)
