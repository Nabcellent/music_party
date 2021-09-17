import React, {Component} from "react";
import {Box, Button, ButtonGroup, Divider, Grid, Paper, TextField, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import axios from "axios";

export default class JoinRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: "",
            error: ""
        }
    }

    render() {
        return (
            <Box flexGrow={1}>
                <Paper style={{maxWidth: 500, padding: '2rem'}}>
                    <Grid container spacing={4} style={{textAlign: 'center'}}>
                        <Grid item xs={12}>
                            <Typography variant={'h5'} component={'h5'}>Join a Room</Typography>
                            <Divider variant={'middle'}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField error={this.state.error} label={'code'} placeholder={'Enter room code'} autoFocus fullWidth required
                                       value={this.state.roomCode} onChange={this._handleCodeInput} helperText={this.state.error}
                                       variant={'outlined'}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant={'contained'} color={'primary'} size={'large'} onClick={this._handleJoinRoom}>Join Room</Button>
                        </Grid>
                        <Grid item xs={12}>
                            <ButtonGroup variant={'contained'} size={'small'} fullWidth>
                                <Button color={'secondary'} variant={'outlined'} to={'/'} component={Link} size={'small'}>Home</Button>
                                <Button variant={'outlined'} color={'primary'} to={'/create'} component={Link}>Create Room</Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        )
    }

    _handleCodeInput = (e) => {
        this.setState({
            roomCode: e.target.value
        });
    }

    _handleJoinRoom = () => {
        axios.post('/api/rooms/join', {
            code: this.state.roomCode
        }).then(response => {
            if (response.status === 200) {
                this.props.history.push(`/room/${this.state.roomCode}`)
            } else {
                this.setState({error: 'Something isn\'t right'})
            }
        }).catch(error => {
            if (error.response) {
                this.setState({error: error.response.data.message})
            } else {
                console.log("Error", error.message)
                console.log(error.config)
            }
        })
    }
}