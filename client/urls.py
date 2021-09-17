from django.urls import path

from client.views import index

app_name = 'client'
urlpatterns = [
    path('', index, name='index'),
    path('room/<str:roomCode>', index),
    path('<path:route>', index),
]
