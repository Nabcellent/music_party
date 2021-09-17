import React, {Component} from "react";
import {Button, ButtonGroup, Divider, Grid, Typography} from "@material-ui/core";
import {BrowserRouter as Router, Link, Redirect, Route, Switch} from "react-router-dom";
import JoinRoom from "./JoinRoom";
import UpsertRoom from "./UpsertRoom";
import Room from "./Room";
import Info from "./Info";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null
        }
    }

    async componentDidMount() {
        axios.get('/api/rooms/has-current-user')
            .then(response => {
                this.setState({roomCode: response.data.code })
            })
    }

    clearRoomCode = () => {
        this.setState({roomCode:null})
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path={'/'} render={() => this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`}/>) : this._renderHome()}/>
                    <Route path={'/join'} component={JoinRoom}/>
                    <Route path={'/create'} component={UpsertRoom}/>
                    <Route path={'/room/:roomCode'} render={(props) => {
                        return <Room {...props} leaveRoomCallback={this.clearRoomCode}/>
                    }}/>
                    <Route path={'/info'} component={Info}/>
                    <Route path="*" render={() => { return <Redirect to="/"/> }}/>
                </Switch>
            </Router>
        )
    }

    _renderHome = () => {
        return (
            <Grid container spacing={10} style={{textAlign: 'center'}}>
                <Grid item xs={12}>
                    <Typography variant={'h3'} component={'h3'}>Music Party</Typography>
                </Grid>

                <Divider style={{width:'100%'}}/>

                <Grid item xs={12}>
                    <ButtonGroup variant={'contained'} color={'primary'} size={'large'} fullWidth>
                        <Button color={'primary'} to={'/join'} component={Link}>Join a Party 🎵</Button>
                        <Button color={'secondary'} to={'/create'} component={Link}>Create a Party 🎶</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12}>
                    <Button variant={'text'} color={'primary'} to={'/info'} component={Link}>Learn...</Button>
                </Grid>
            </Grid>
        )
    }
}