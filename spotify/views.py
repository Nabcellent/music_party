from django.shortcuts import redirect
from requests import Request
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Room
from spotify.models import Vote
from spotify.utils import *


# Create your views here.
class AuthURL(APIView):
    def get(self, request):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read ' \
                 'user-library-read playlist-modify-public playlist-read-collaborative user-read-playback-position ' \
                 'user-read-recently-played user-top-read user-follow-read streaming'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': config('REDIRECT_URI'),
            'client_id': config('CLIENT_ID')
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request):
    code = request.GET.get('code')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': config('REDIRECT_URI'),
        'client_id': config('CLIENT_ID'),
        'client_secret': config('CLIENT_SECRET')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    session_key = request.session.session_key
    upsert_user_tokens(session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('client:index')


class IsAuthenticated(APIView):
    def get(self, request):
        user_is_authenticated = is_authenticated(self.request.session.session_key)

        return Response({'status': user_is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room.first()
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        endpoint = 'player/currently-playing?market=KE'
        response = execute_api_request(room.host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        song_id = item.get('id')

        artist = ""
        for i, art in enumerate(item.get('artists')):
            if i > 0:
                artist += ', '
            artist += art.get('name')

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            'title': item.get('name'),
            'artist': artist,
            'duration': item.get('duration_ms'),
            'time': response.get('progress_ms'),
            'image_url': item.get('album').get('images')[0].get('url'),
            'is_playing': response.get('is_playing'),
            'id': song_id,

            'votes': votes,
            'votes_to_skip': room.votes_to_skip
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])

            Vote.objects.filter(room=room).delete()


class SavedTracks(APIView):
    def get(self, request):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room.first()
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        # FETCH TRACKS
        endpoint = 'tracks?market=KE'
        response = execute_api_request(room.host, endpoint)

        if 'error' in response or 'items' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        tracks = []

        for item in response.get('items'):
            tracks.append(item.get('track').get('uri'))

        # FETCH DEVICES
        endpoint = 'player/devices'
        response = execute_api_request(room.host, endpoint)

        if 'error' in response or 'devices' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        devices = []

        for item in response.get('devices'):
            if not item.get('is_restricted'):
                devices.append(item.get('id'))

        return Response({'tracks': tracks, 'devices': devices}, status=status.HTTP_200_OK)


class PlayPauseSong(APIView):
    def put(self, request):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_pause_song(room.host, request.data.get('play'))

            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        user_session = self.request.session.session_key
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room.first()
            votes = Vote.objects.filter(room=room, song_id=room.current_song)
            votes_needed = room.votes_to_skip

            skip = request.data.get('skip')

            if user_session == room.host or len(votes) + 1 >= votes_needed:
                votes.delete()
                skip_song(room.host, skip)
            elif not Vote.objects.filter(user=user_session).exists():
                vote = Vote(user=user_session, room=room, song_id=room.current_song)
                vote.save()

            return Response({}, status.HTTP_204_NO_CONTENT)
        return Response({'message': 'Unable to find room'}, status.HTTP_404_NOT_FOUND)
