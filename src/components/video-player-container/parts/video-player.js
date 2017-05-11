// @flow
import React from 'react';
import classnames from 'classnames';
import { browserHistory } from 'react-router';
// $FlowFixMe
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import VideoPlayerControls from './video-player-controls';
import './video-player.css';
import Back from '../../../../public/assets/RW.svg';
import { saveVideoProgress, getProgressTimeById } from '../../../api/local-storage';

window.videojs = videojs;
// eslint-disable-next-line
require('videojs-contrib-hls/dist/videojs-contrib-hls.js');

export type VideoPlayerPropsType = {
  videoUrl: string,
  currentEpisodeId: number,
  showUI: boolean,
  isMuted: boolean,
  posterImage: ?string,
};
export type VideoPlayerStateType = {
  isVideoPlaying: boolean,
  timeProgress: number,
  isControlSelected: boolean,
}

const videoJsOptions = (videoUrl: string, isMuted: boolean) => ({
  preload: 'auto',
  autoplay: true,
  muted: isMuted,
  controls: false,
  sources: [{
    src: videoUrl,
    type: 'application/x-mpegURL',
  }],
});

class VideoPlayer extends React.Component {
  static getProgress(player) {
    return (100 / player.duration()) * player.currentTime();
  }
  static getDelayedProgressTime(progress, lag) {
    let progressResult = 0;
    if (progress) {
      progressResult = (progress < lag) ? 0 : (progress - lag);
    }
    return progressResult;
  }

  constructor(props: VideoPlayerPropsType) {
    super(props);
    (this: any).moveTime = 10;
    (this: any).videoNode = null;
    (this: any).player = null;
    this.state = {
      isVideoPlaying: true,
      timeProgress: 0,
      isControlSelected: true,
    };
    (this: any).handleFastForward = this.handleFastForward.bind(this);
    (this: any).handlePlay = this.handlePlay.bind(this);
    (this: any).handlePause = this.handlePause.bind(this);
    (this: any).handleRewind = this.handleRewind.bind(this);
    (this: any).handleVideoLoad = this.handleVideoLoad.bind(this);
    (this: any).handleEndReached = this.handleEndReached.bind(this);
    (this: any).handleTimeUpdate = this.handleTimeUpdate.bind(this);
    (this: any).handleNavigationState = this.handleNavigationState.bind(this);
  }
  state: VideoPlayerStateType;
  componentDidMount() {
    const {
      videoUrl,
      isMuted,
    } = this.props;
    (this: any).player = videojs((this: any).videoNode, { ...videoJsOptions(videoUrl, isMuted) });
    document.addEventListener('keydown', this.handleNavigationState);
  }
  componentWillUnmount() {
    const { currentEpisodeId: id } = this.props;
    const timeProgress: number = Math.round((this: any).player.currentTime());
    saveVideoProgress(id, timeProgress);

    if ((this: any).player) {
      (this: any).player.dispose();
    }
    document.removeEventListener('keydown', this.handleNavigationState);
  }
  handleNavigationState(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        (this: any).setState({
          isControlSelected: false,
        });
        break;
      case 'ArrowDown':
        (this: any).setState({
          isControlSelected: true,
        });
        break;
      case 'Enter':
        if (!(this: any).state.isControlSelected) {
          browserHistory.goBack();
        }
        break;
      case 'Backspace':
        browserHistory.goBack();
        break;
      default:
    }
  }
  props: VideoPlayerPropsType;
  handlePlay() {
    this.setState({
      isVideoPlaying: true,
    });
    (this: any).player.play();
  }
  handlePause() {
    this.setState({
      isVideoPlaying: false,
    });
    (this: any).player.pause();
  }
  handleRewind() {
    (this: any).player.currentTime((this: any).player.currentTime() - (this: any).moveTime);
  }
  handleFastForward() {
    if ((this: any).player.remainingTime() > 10) {
      (this: any).player.currentTime((this: any).player.currentTime() + (this: any).moveTime);
    }
  }
  handleVideoLoad() {
    const { currentEpisodeId: id } = this.props;
    const lagTime: number = 5;
    const lastTimeProgress: number = getProgressTimeById(id);
    const delayedProgressTime: number =
    VideoPlayer.getDelayedProgressTime(lastTimeProgress, lagTime);
    (this: any).player.currentTime(delayedProgressTime);
  }
  handleEndReached() {
    this.setState({
      isVideoPlaying: false,
    });
  }
  handleTimeUpdate() {
    const progress = VideoPlayer.getProgress((this: any).player);
    this.setState({
      timeProgress: Math.round(progress),
    });
  }

  render() {
    const {
      showUI,
      posterImage,
    } = this.props;
    const videoBackButtonClassName = classnames({
      'video-player-back-button': true,
      selected: !this.state.isControlSelected,
    });
    const videoPlayerControls = showUI ? (
      <VideoPlayerControls
        playVideo={this.handlePlay}
        pauseVideo={this.handlePause}
        isVideoPlaying={this.state.isVideoPlaying}
        isControlSelected={this.state.isControlSelected}
        fastForward={this.handleFastForward}
        fastRewind={this.handleRewind}
        progress={this.state.timeProgress}
      />
    ) : null;
    const backButton = showUI ? (
      <button className={videoBackButtonClassName} onClick={browserHistory.goBack}>
        <img src={Back} alt="Back" className="video-player-back-icons" />
      </button>
    ) : null;
    return (
      <div className="video-player">
        <div data-vjs-player>
          {backButton}
          <video
            ref={(node) => { (this: any).videoNode = node; }}
            onLoadedData={this.handleVideoLoad}
            onEnded={this.handleEndReached}
            onTimeUpdate={this.handleTimeUpdate}
            className="video-js vjs-big-play-centered"
            poster={posterImage}
          />
          {videoPlayerControls}
        </div>
      </div>);
  }
}

export default VideoPlayer;
