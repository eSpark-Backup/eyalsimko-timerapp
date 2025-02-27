import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = () => {
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
});

export default BackgroundBlur;