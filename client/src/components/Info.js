import React, {useState, useEffect} from "react";
import {Box, Button, Divider, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles, Paper, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import {MusicNote, NavigateBefore, NavigateNext} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 500,
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    list: {
        backgroundColor: theme.palette.background.default,
    },
    btnHoverFocus: {
        "&:hover, &.Mui-focusVisible": {
            backgroundColor: "rgba(50, 150, 200, .7)",
            color: '#fff'
        },
        boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)'
    }
}));

const pages = {
    JOIN: 'page.join',
    CREATE: 'page.create',
}

export default function Info() {
    const [page, setPage] = useState(pages.JOIN)
    const classes = useStyles();

    useEffect(() => {
        //  equivalent of componentDidMount() and componentWillMount()
        console.log('ran')

        //  componentWillUnmount() equivalent
        return () => console.log('cleanup')
    })

    function joinInfo() {
        return (
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant={'body1'}>
                        Imagine you and your friends playing one song🎶 at the same time😀. You will not lose the vibe. This Music Party
                        synchronizes your devices and spotify to play the same
                        song at the same time.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body1'}>
                        Now plan that party!🥳 With this Music Party, you can either create a party with your spotify
                        account or join a party and listen to your friend’s songs.😁
                    </Typography>
                </Grid>
            </Grid>
        );
    }

    function createInfo() {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant={'h6'}>Create a party</Typography>
                    <div className={classes.list}>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><MusicNote/></ListItemIcon>
                                <ListItemText primary="Step 1" secondary={(
                                    <div>From the home page, go to <code>Create a Party 🎵</code>, set guest permissions and number of votes
                                        required to skip to the next song. finally, click <code>Create Room</code>.</div>)}>
                                </ListItemText>
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><MusicNote/></ListItemIcon>
                                <ListItemText primary="Step 2" secondary={(
                                    <div>Authorize your premium spotify account to connect with music party.</div>)}>
                                </ListItemText>
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><MusicNote/></ListItemIcon>
                                <ListItemText primary="Step 2" secondary={(
                                    <div>Once redirected back to Music Party, share the generated <code>Room Code</code> with your friends and
                                        enjoyyy.🥳</div>)}>
                                </ListItemText>
                            </ListItem>
                        </List>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'h6'} paragraph>Join a party</Typography>
                    <div className={classes.list}>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><MusicNote/></ListItemIcon>
                                <ListItemText primary="Step 1" secondary={(
                                    <div>From the home page, go to <code>Join a Party 🎶</code>, Key in a valid Room Code from your friend.
                                        Click <code>Join Room</code> and enjoyyy.🥳</div>)}>
                                </ListItemText>
                            </ListItem>
                        </List>
                    </div>
                </Grid>
            </Grid>
        );
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Grid container spacing={3} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={12} align={'center'}>
                        <Typography component={'h4'} variant={'h4'}>What is Music Party?</Typography>
                        <Divider variant={'middle'}/>
                    </Grid>

                    <Grid item xs={12}>
                        {page === pages.JOIN ? joinInfo() : createInfo()}
                    </Grid>

                    <Grid item xs={12} align={'center'}>
                        <IconButton color={'primary'} className={classes.btnHoverFocus} onClick={() => {
                            page === pages.CREATE ? setPage(pages.JOIN) : setPage(pages.CREATE)
                        }}>
                            {page === pages.CREATE ? <NavigateBefore/> : <NavigateNext/>}
                        </IconButton>
                    </Grid>

                    <Grid item xs={12}>
                        <Button color={'secondary'} size={'small'} variant={'contained'} to={'/'} component={Link}>Home</Button>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}

