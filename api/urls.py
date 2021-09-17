from django.urls import path, include
from .views import *

urlpatterns = [
    path('rooms/', include([
        path('', RoomView.as_view()),

        path('room', GetRoom.as_view()),
        path('create', CreateRoom.as_view()),
        path('join', JoinRoom.as_view()),
        path('has-current-user', HasCurrentUser.as_view()),
        path('leave', LeaveRoom.as_view()),
        path('update', UpdateRoom.as_view())
    ]))
]
