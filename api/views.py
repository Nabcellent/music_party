from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Room
from api.serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer


# Create your views here.
from spotify.models import SpotifyToken


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request):
        code = request.GET.get(self.lookup_url_kwarg)

        if code is not None:
            room = Room.objects.filter(code=code)

            if room.exists():
                data = RoomSerializer(room.first()).data
                data['isHost'] = self.request.session.session_key == room.first().host

                user_tokens = SpotifyToken.objects.filter(user=data.get('host'))

                if user_tokens.exists():
                    data['accessToken'] = user_tokens.first().access_token

                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room not found': 'Invalid room code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad request': 'Code not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)

        if code is not None:
            room = Room.objects.filter(code=code)

            if room.exists():
                self.request.session['room_code'] = code

                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'message': 'Invalid code! Room not found☹'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Invalid request! please provide a room code.'}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoom(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            room = Room.objects.filter(host=host)

            if room.exists():
                room = room.first()
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()

            self.request.session['room_code'] = room.code

            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response({'Bad request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class HasCurrentUser(APIView):
    def get(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')

            host_id = self.request.session.session_key
            room = Room.objects.filter(host=host_id)

            if room.exists():
                room.first().delete()

        return Response({'message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            room = Room.objects.filter(code=code)

            if not room.exists():
                return Response({'message': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

            room = room.first()
            user_id = self.request.session.session_key

            if room.host != user_id:
                return Response({'message': 'You ain\'t no host Mate!'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        return Response({'message': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
