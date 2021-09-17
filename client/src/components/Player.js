import React, {useState, useEffect} from "react";
import {Badge, Box, Card, Grid, IconButton, LinearProgress, Typography} from "@material-ui/core";
import {Pause, PlayArrow, SkipNext, SkipPrevious} from "@material-ui/icons";
import {Slider, Stack} from "@mui/material";
import {VolumeDown, VolumeUp} from "@mui/icons-material";

export default function Player(props) {
    const [volume, setVolume] = useState(30);
    const songProgress = (props.time / props.duration) * 100
    const diff = Math.random() * 3;
    const diff2 = Math.random() * 7;
    const buffer = songProgress + diff + diff2
    const badgeCount = props.votes ? `${props.votes}/${props.votes_to_skip}` : 0

    const _handleSkipSong = (skip) => axios.post('/spotify/skip', {skip}).then(() => null, err => console.log(err))
    const _handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        props.player.setVolume(newValue / 100)
    };

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
                            {props.isHost ? <IconButton onClick={() => _handleSkipSong(0)}><SkipPrevious/></IconButton> : null}
                            <IconButton id={'togglePlay'}>{props.is_playing ? <Pause/> : <PlayArrow/>}</IconButton>
                            <IconButton onClick={() => _handleSkipSong(1)}><SkipNext/></IconButton>
                        </div>

                        <div>
                            <Badge badgeContent={badgeCount} color="secondary"/>
                            {badgeCount !== 0 ? (
                                <Typography display={'block'} color={'textSecondary'} variant={'caption'}>Votes to skip</Typography>) : null}
                        </div>
                        <Grid container>
                            <Box sx={{width: 200}}>
                                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                                    <VolumeDown/>
                                    <Slider aria-label="Volume" defaultValue={volume} valueLabelDisplay={'auto'} min={0} max={100}
                                            onChange={_handleVolumeChange}/>
                                    <VolumeUp/>
                                </Stack>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <LinearProgress variant={'buffer'} value={songProgress} valueBuffer={buffer}/>
        </Card>
    )
}