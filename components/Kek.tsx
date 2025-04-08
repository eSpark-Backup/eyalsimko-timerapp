import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia';

// Get the screen width and height
const { width, height } = Dimensions.get('window');

const BackgroundBlur = () => {
  // Check if the platform is web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* Web fallback (use native CSS for blur effect) */}
        <div style={[styles.rect, styles.rectRed]}></div>
        <div style={[styles.rect, styles.rectBlue]}></div>
        <div style={[styles.rect, styles.rectGreen]}></div>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.absolute}>
        {/* First Rectangle */}
        <Rect x={50} y={100} width={150} height={150} color="red">
          <BlurMask blur={20} style="normal" />
        </Rect>

        {/* Second Rectangle */}
        <Rect x={200} y={250} width={180} height={180} color="blue">
          <BlurMask blur={30} style="normal" />
        </Rect>

        {/* Third Rectangle */}
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
    backgroundColor: 'black', // Background color for contrast
  },
  absolute: {
    position: 'absolute',
    width: width,
    height: height,
  },
  rect: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  rectRed: {
    backgroundColor: 'red',
    top: 100,
    left: 50,
    filter: 'blur(20px)', // Web blur effect for red rectangle
  },
  rectBlue: {
    backgroundColor: 'blue',
    top: 250,
    left: 200,
    filter: 'blur(30px)', // Web blur effect for blue rectangle
  },
  rectGreen: {
    backgroundColor: 'green',
    top: 400,
    left: 100,
    filter: 'blur(25px)', // Web blur effect for green rectangle
  },
});

export default BackgroundBlur;
