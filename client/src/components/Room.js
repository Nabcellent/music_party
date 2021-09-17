import React, {Component} from "react";
import {Button, Grid, Typography} from "@material-ui/core";
import UpsertRoom from "./UpsertRoom";
import Player from "./Player";

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            accessToken: null,

            spotifyAuthenticated: false,
            song: {}
        }

        this.roomCode = this.props.match.params.roomCode
    }

    componentDidMount() {
        this._getRoomDetails()
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    _getRoomDetails = () => {
        axios.get(`/api/rooms/room?code=${this.roomCode}`)
            .then(response => {
                const {data} = response;

                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                })

                if (this.state.isHost) this._authenticateSpotify();

                this._getSavedTracks()
                this.interval = setInterval(this._getCurrentSong, 1000)
            }).catch(error => {
            this.props.leaveRoomCallback()
            this.props.history.push('/')
            console.log(error)
        })
    }

    _getCurrentSong = () => {
        axios.get('/spotify/current-song').then(response => {
            const {data} = response

            this.setState({song: data})
        }).catch(() => this._handleLeaveRoom())
    }

    _getSavedTracks = () => {
        axios.get('/spotify/tracks').then(response => {
            const {data} = response

            this._play(data)
            this.setState({song: data})
        }).catch(() => this._handleLeaveRoom())
    }

    _handleLeaveRoom = () => {
        axios.post(`/api/rooms/leave`).then(_response => {
            this.props.leaveRoomCallback()
            this.props.history.push('/')
        })
    }

    _showSettings = value => this.setState({showSettings: value})

    _renderRoom = () => {
        return (
            <Grid container spacing={2} style={{textAlign: 'center'}}>
                <Grid item xs={12}>
                    <Typography variant={'h5'} component={'h5'}>Room Code: {this.roomCode}</Typography>
                </Grid>

                <Grid item xs={12}>
                    <Player {...this.state.song}/>
                </Grid>

                {
                    this.state.isHost ? (
                        <Grid item xs={12}>
                            <Button color={'primary'} variant={'contained'} size={'small'} onClick={() => this._showSettings(true)}>Settings</Button>
                        </Grid>
                    ) : null
                }

                <Grid item xs={12}>
                    <Button color={'secondary'} variant={'outlined'} size={'small'} onClick={this._handleLeaveRoom}>Leave room</Button>
                </Grid>
            </Grid>
        )
    }

    _renderSettings = () => {
        const {votesToSkip, guestCanPause} = this.state

        return (
            <Grid container spacing={1} style={{textAlign: 'center'}}>
                <Grid item xs={12}>
                    <UpsertRoom update={true} votesToSkip={votesToSkip} guestCanPause={guestCanPause} roomCode={this.roomCode}
                                updateCallback={this._getRoomDetails}/>
                </Grid>
                <Grid item xs={12}>
                    <Button color={'secondary'} variant={'contained'} onClick={() => this._showSettings(false)}>Close settings</Button>
                </Grid>
            </Grid>
        )
    }

    render() {
        return this.state.showSettings ? this._renderSettings() : this._renderRoom();
    }

    _authenticateSpotify = () => {
        axios.get('/spotify/is-authenticated').then(response => {
            const {data} = response;

            if (!data.status)
                axios.get('/spotify/get-auth-url').then(response => window.location.replace(response.data.url))

            this.setState({spotifyAuthenticated: data.status, accessToken: data.accessToken})
        })
    }

    _play = (tracks) => {
        loadScript('https://sdk.scdn.co/spotify-player.js')

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = this.state.accessToken;
            const player = new Spotify.Player({
                name: 'Music Party',
                getOAuthToken: cb => cb(token),
                volume: 0.5
            });

            player.addListener('ready', ({device_id}) => {
                const play = ({
                                  spotify_uri,
                                  playerInstance: {
                                      _options: {
                                          getOAuthToken
                                      }
                                  }
                              }) => {
                    getOAuthToken(access_token => {
                        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                uris: spotify_uri
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${access_token}`
                            },
                        });
                    });
                };

                play({
                    playerInstance: player,
                    spotify_uri: tracks
                });
            });

            // Not Ready
            player.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('initialization_error', ({message}) => {
                console.error(message);
            });

            player.addListener('authentication_error', ({message}) => {
                console.error(message);
            });

            player.addListener('account_error', ({message}) => {
                console.error(message);
            });

            document.getElementById('togglePlay').onclick = function () {
                player.togglePlay();
            };

            player.connect();
        }
    }
}