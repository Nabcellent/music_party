from django.db import models
from api.models import Room


# Create your models here.
class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=255)
    token_type = models.CharField(max_length=50)
    expires_in = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)


class Vote(models.Model):
    user = models.CharField(max_length=50, unique=True)
    song_id = models.CharField(max_length=50)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)