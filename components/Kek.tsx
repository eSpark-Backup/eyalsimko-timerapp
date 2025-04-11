import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = () => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div style={{
          position: 'absolute',
          width: width,
          height: height,
        }}>
          <div style={{
            position: 'absolute',
            top: 100,
            left: 50,
            width: 150,
            height: 150,
            backgroundColor: 'rgba(209°, 100%, 5%)',
            filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute',
            top: 250,
            left: 200,
            width: 180,
            height: 180,
            backgroundColor: 'rgba(209°, 100%, 5%)',
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute',
            top: 400,
            left: 100,
            width: 160,
            height: 160,
            backgroundColor: 'rgba(209°, 100%, 5%)',
            filter: 'blur(25px)',
          }} />
        </div>
      </View>
    );
  }

  // Rest of your mobile code remains the same
  return (
    <View style={styles.container}>
      <Canvas style={styles.absolute}>
        <Rect x={50} y={100} width={150} height={150} color="red">
          <BlurMask blur={20} style="normal" />
        </Rect>
        <Rect x={200} y={250} width={180} height={180} color="blue">
          <BlurMask blur={30} style="normal" />
        </Rect>
        <Rect x={100} y={400} width={160} height={160} color="green">
          <BlurMask blur={25} style="normal" />
        </Rect>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    width: width,
    height: height,
  },
});

export default BackgroundBlur;
