import React, {Component} from "react";
import {
    Box,
    Button, ButtonGroup, Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid, makeStyles, Paper, Radio,
    RadioGroup, TextField,
    Typography
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";

export default class UpsertRoom extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip
        }
    }

    _handleGuestCanPause = (e) => {
        this.setState({
            guestCanPause: e.target.value === 'true'
        })
    }

    _handleVotesChange = (e) => {
        this.setState({
            votesToSkip: e.target.value,
        })
    }

    _handleCreateRoom = () => {
        axios.post('/api/rooms/create', {
            guest_can_pause: this.state.guestCanPause,
            votes_to_skip: this.state.votesToSkip
        }).then(response => this.props.history.push('/room/' + response.data.code))
            .catch(error => console.log(error));
    }

    _handleUpdateRoom = () => {
        axios.patch('/api/rooms/update', {
            guest_can_pause: this.state.guestCanPause,
            votes_to_skip: this.state.votesToSkip,
            code: this.props.roomCode,
        }).then(() => {
            toast.success("Room updated successfully !");

            this.props.updateCallback()
        }).catch(() => {
            toast.error('Error updating room... !')
        });
    }

    _renderCreateButtons = () => {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align={'center'}>
                    <Button color={'primary'} variant={'contained'} size={'large'} onClick={this._handleCreateRoom}>Create Room</Button>
                </Grid>
                <Grid item xs={12} align={'center'}>
                    <ButtonGroup variant={'contained'} size={'small'} fullWidth>
                        <Button color={'secondary'} variant={'outlined'} to={'/'} component={Link} size={'small'}>Home</Button>
                        <Button variant={'outlined'} color={'primary'} to={'/join'} component={Link}>Join Room</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        )
    }

    _renderUpdateButtons = () => {
        return (
            <Grid item xs={12} align={'center'}>
                <Button color={'primary'} variant={'contained'} size={'small'} onClick={this._handleUpdateRoom}>Update Room</Button>
            </Grid>
        )
    }

    render() {
        const title = this.props.update ? 'Update Room' : 'Create a Room'

        return (
            <Box flexGrow={1}>
                <Paper style={{maxWidth:500, padding:'2rem'}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} align={'center'}>
                            <Typography component={'h5'} variant={'h5'}>{title}</Typography>
                            <Divider variant={'middle'}/>
                        </Grid>

                        <Grid item xs={12} align={'center'}>
                            <FormControl component={'fieldset'}>
                                <FormHelperText>
                                    <div align={'center'}>Guest control of playback state</div>
                                </FormHelperText>
                                <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this._handleGuestCanPause}>
                                    <FormControlLabel control={<Radio color={'primary'}/>} label={'Play/Pause'} labelPlacement={'bottom'}
                                                      value={'true'}/>
                                    <FormControlLabel control={<Radio color={'secondary'}/>} label={'No control'} labelPlacement={'bottom'}
                                                      value={'false'}/>
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} align={'center'}>
                            <FormControl>
                                <FormHelperText>
                                    <div align={'center'}>Votes required to skip</div>
                                </FormHelperText>
                                <TextField required={true} type={'number'} defaultValue={this.state.votesToSkip}
                                           inputProps={{min: 1, style: {textAlign: 'center'}}} onChange={this._handleVotesChange}/>
                            </FormControl>
                        </Grid>

                        {this.props.update ? this._renderUpdateButtons() : this._renderCreateButtons()}
                    </Grid>
                </Paper>
            </Box>
        );
    }
}