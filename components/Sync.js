/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, Dimensions, Button, StyleSheet, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { Video } from 'expo-av';
// import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';

let date1 = 0;
let date2 = 0;

const Sync = () => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [vidARef, setVidARef] = useState(null);
  const [vidBRef, setVidBRef] = useState(null);
  const [vid1Ready, setVid1Ready] = useState(false);
  const [vid2Ready, setVid2Ready] = useState(false);
  const [bothVidsReady, setBothVidsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [customOffset, setCustomOffset] = useState(0);

  const handlePlaybackStatusUpdate = (updateObj, whichVid) => {
    if (whichVid === 'vid1') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true)
      } else if (!vid1Ready && vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true);
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    } else if (whichVid === 'vid2') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid2Ready(true)
      } else if (vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    }
  };

  const handleShowPreview = async () => {
    if (previewComplete) setPreviewComplete(false);
    try {
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date2 = Date.now();
      setIsPlaying(true);
    } catch (e) {
      console.log('error in handleShowPreview: ', e)
    }
  };

  const handleSyncBack = async () => {
    try {
      const { positionMillis } = await vidARef.getStatusAsync();
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      setCustomOffset(customOffset - 50);
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset <= 0 ? positionMillis : positionMillis + customOffset - 50,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset <= 0 ? positionMillis + ((customOffset - 50) * -1) : positionMillis,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date2 = Date.now();
    } catch (e) {
      console.log('error in handleSyncBack: ', e)
    }
  };

  const handleSyncForward = async () => {
    try {
      const { positionMillis } = await vidARef.getStatusAsync();
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      setCustomOffset(customOffset + 50);
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset <= 0 ? positionMillis : positionMillis + customOffset + 50,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset <= 0 ? positionMillis + ((customOffset + 50) * -1) : positionMillis,
        // seekMillisToleranceBefore: 0,
        // seekMillisToleranceAfter: 0,
      })
      date2 = Date.now();
    } catch (e) {
      console.log('error in handleSyncForward: ', e)
    }
  };

  console.log('customOffset: ', customOffset);
  console.log('delay: ', date2 - date1);

  return (
    <ScrollView style={{
      ...styles.container,
      paddingTop: previewComplete ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
    }}>
      <View style={{
        flexDirection: 'row',
        marginTop: !previewComplete && Platform.OS === 'ios' ? 20 : 0,
      }}>
        <Video
          ref={ref => setVidARef(ref)}
          source={require('../assets/L-O-V-E.mov')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          // positionMillis={0}
          isLooping={false}
          style={{
            width: screenWidth / 2,
            height: screenWidth / 16 * 9,
          }}
          onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid1')}
        />
        <Video
          ref={ref => setVidBRef(ref)}
          source={require('../assets/L-O-V-E.mov')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          isLooping={false}
          style={{
            width: screenWidth / 2,
            height: screenWidth / 16 * 9,
          }}
          onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid2')}
        />
        {
          // if preview hasn't played yet
          !previewComplete && !isPlaying ? (
            <TouchableOpacity
              onPress={handleShowPreview}
              style={{
                ...styles.overlay,
                width: screenWidth,
                height: screenWidth / 16 * 9
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{
                  fontSize: screenWidth / 20,
                  fontWeight: 'bold',
                  marginRight: 10,
                }}>
                  {bothVidsReady ? 'Touch to preview!' : 'Loading...'}
                </Text>
                {
                  !bothVidsReady &&
                  <ActivityIndicator size="small" color="#0047B9" />
                }
              </View>
            </TouchableOpacity>
          ) : (
              // if preview has played (previewComplete)
              previewComplete &&
              <TouchableOpacity
                style={{
                  ...styles.overlay,
                  opacity: 0.8,
                  paddingTop: 40,
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  width: screenWidth,
                  height: screenWidth / 16 * 9,
                }}>
                <TouchableOpacity
                  style={{
                    ...styles.button,
                    width: 200,
                  }}
                  onPress={handleShowPreview}>
                  <Text
                    style={styles.buttonText}>
                    View again
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
        }
      </View>
      {
        !previewComplete &&
        <View>
          <Text
            style={styles.instruction}>Not perfectly in sync? Use the arrows below to adjust to your taste!
          </Text>
          <View
            style={styles.syncIconsContainer}>
            <Icon
              onPress={isPlaying ? handleSyncBack : () => { }}
              underlayColor="black"
              name="fast-rewind"
              type="material"
              color="white"
              size={50} />
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                alignSelf: 'center',
              }}>|
            </Text>
            <Icon
              onPress={isPlaying ? handleSyncForward : () => { }}
              underlayColor="black"
              name="fast-forward"
              type="material"
              color="white"
              size={50} />
          </View>
          <Text
            style={styles.hintTitle}>Hint:
          </Text>
          <View
            style={styles.hintContainer}>
            <Text
              style={{ color: 'white', fontSize: 14, }}>If the right video is <Text style={{ color: 'yellow' }}>behind</Text> the left video, press
            </Text>
            <Icon
              name="fast-forward"
              type="material"
              color="yellow" />
          </View>
          <View
            style={{
              ...styles.hintContainer,
              marginBottom: 10,

            }}>
            <Text
              style={{ color: 'white', fontSize: 14, }}>If the right video is <Text style={{ color: 'yellow' }}>ahead of</Text> the left video, press
            </Text>
            <Icon
              name="fast-rewind"
              type="material"
              color="yellow" />
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
            <TouchableOpacity
              style={{
                ...styles.button,
                width: 100,
                marginBottom: 10,
              }}
              onPress={handleShowPreview} >
              <Text
                style={{
                  ...styles.buttonText,
                  fontSize: Platform.OS === 'ios' ? 20 : 17,
                  fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                }}>{!previewComplete && !isPlaying && bothVidsReady ? 'Preview' : 'Restart'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity
                onPress={isPlaying ? handleProblem : handleHardRefresh}
                style={styles.problemContainer}
              >
                <Text style={{ fontSize: 16, color: 'red' }}>Touch here to refresh.</Text>
              </TouchableOpacity> */}
        </View>
      }
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'black',
    height: '100%',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  },
  overlayText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'white',
  },
  button: {
    backgroundColor: '#0047B9',
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderColor: 'darkblue',
    borderWidth: 2,
    paddingHorizontal: 7
  },
  buttonText: {
    fontFamily: 'Gill Sans',
    fontSize: Platform.OS === 'android' ? 20 : 22,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'white',
    marginHorizontal: 7,
    marginVertical: 8,
    fontWeight: 'normal'
  },
  instruction: {
    color: 'white',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 15 : 5,
    textAlign: 'center',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },
  syncIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontStyle: 'italic',
    marginTop: Platform.OS === 'ios' ? 10 : 4,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  volumeControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
    marginRight: 20,
    marginLeft: 20,
  },
  volumeControlsTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    // marginTop: 10,
    marginBottom: 14,
  },
  volumeButtonsContainer: {
    flexDirection: 'row',
  },
  volumeControlsButton: {
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeInstructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  volumeButtonText: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 2,
    fontSize: 20,
  },
  problemContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 5,
    height: 30,
  },
});

export default Sync;
