import React, {useState, useEffect} from "react";
import {Badge, Box, Card, Grid, IconButton, LinearProgress, Typography} from "@material-ui/core";
import {Pause, PlayArrow, SkipNext} from "@material-ui/icons";

export default function Player(props) {
    const _handleSkipSong = () => axios.post('/spotify/skip').then(() => null, err => console.log(err))

    const songProgress = (props.time / props.duration) * 100

    const diff = Math.random() * 3;
    const diff2 = Math.random() * 7;
    const buffer = songProgress + diff + diff2
    const badgeCount = props.votes ? `${props.votes}/${props.votes_to_skip}` : 0

    return (
        <Card raised={true}>
            <Grid container style={{textAlign: 'center'}}>
                <Grid item xs={4}>
                    <img src={props.image_url} height={'100%'} width={'100%'} alt={props.artist}/>
                </Grid>
                <Grid item xs={8} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Box component={'div'}>
                        <Typography component={'h5'} variant={'h5'}>{props.title}</Typography>
                        <Typography color={'textSecondary'} variant={'subtitle1'}>{props.artist}</Typography>

                        <div>
                            <IconButton id={'togglePlay'}>{props.is_playing ? <Pause/> : <PlayArrow/>}</IconButton>
                            <Badge badgeContent={badgeCount} color="secondary">
                                <IconButton onClick={_handleSkipSong}><SkipNext/></IconButton>
                            </Badge>
                        </div>
                    </Box>
                </Grid>
            </Grid>
            <LinearProgress variant={'buffer'} value={songProgress} valueBuffer={buffer}/>
        </Card>
    )
}