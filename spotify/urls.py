from django.urls import path

from spotify.views import *

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('tracks', SavedTracks.as_view()),
    path('play-pause', PlayPauseSong.as_view()),
    path('skip', SkipSong.as_view()),
]