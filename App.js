import 'react-native-gesture-handler'
import React, { useState } from 'react';
import { StyleSheet, Dimensions, Image, SafeAreaView } from 'react-native';
import Animated, { interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const cards = [
  { id: 1, uri: require('./assets/blue.png') },
  { id: 2, uri: require('./assets/green.png') },
  { id: 3, uri: require('./assets/yellow.png') },
  { id: 4, uri: require('./assets/orange.png') },
  { id: 5, uri: require('./assets/red.png') },
]

const screenWidth = Dimensions.get('screen').width;
export const cardWidth = screenWidth * 0.85;

const Card = ({ img, numOfCards, curIndex, activeIndex, onResponse }) => {
  const translationX = useSharedValue(0);

  const animatedCard = useAnimatedStyle(() => ({
    opacity: interpolate(activeIndex.value, [curIndex - 3, curIndex - 2, curIndex - 1, curIndex, curIndex + 1, curIndex + 2, curIndex + 3], [0, 1, 1, 1, 1, 1, 0]),
    transform: [
      {
        scaleX: interpolate(activeIndex.value, [curIndex - 1, curIndex, curIndex + 1], [0.925, 1, 1]),
      },
      { translateY: interpolate(activeIndex.value, [curIndex - 1, curIndex, curIndex + 1], [12.5, 0, 0]) },
      {
        translateX: translationX.value,
      },
      {
        rotateZ: `${interpolate(translationX.value, [-screenWidth / 2, 0, screenWidth / 2], [-15, 0, 15])}deg`,
      }
    ]
  }));

  const animatedLike = useAnimatedStyle(() => ({
    opacity: interpolate(translationX.value, [-screenWidth / 2, 0, screenWidth / 2], [0, 0, 1], 'clamp'),
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 100,
  }));

  const animatedDislike = useAnimatedStyle(() => ({
    opacity: interpolate(translationX.value, [-screenWidth / 2, 0, screenWidth / 2], [1, 0, 0], 'clamp'),
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 100,
  }));

  const gesture = Gesture.Pan()
    .onChange((event) => {
      translationX.value = event.translationX;

      activeIndex.value = interpolate(
        Math.abs(translationX.value),
        [0, 500],
        [curIndex, curIndex + 0.8]
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > 400) {
        translationX.value = withSpring(Math.sign(event.velocityX) * 500, {
          velocity: event.velocityX,
        });
        activeIndex.value = withSpring(curIndex + 1);

        runOnJS(onResponse)(event.velocityX > 0);
      } else {
        translationX.value = withSpring(0);
      }
    });

  return (
    <GestureHandlerRootView
      style={{
        zIndex: numOfCards - curIndex,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[
          styles.card,
          animatedCard,
          {
            zIndex: numOfCards - curIndex,
          }
        ]}>
          <Animated.View style={[
            animatedLike
          ]}>
            <Image
              source={require('./assets/checkIcon.png')}
              style={{
                width: 120,
                height: 120,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>

          <Animated.View style={[
            animatedDislike
          ]}>
            <Image
              source={require('./assets/crossIcon.png')}
              style={{
                width: 120,
                height: 120,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>

          <Image
            style={[StyleSheet.absoluteFillObject, styles.image]}
            source={img}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const App = () => {
  const activeIndex = useSharedValue(0);
  const [index, setIndex] = useState(0);

  useAnimatedReaction(
    () => activeIndex.value,
    (value, prevValue) => {
      if (Math.floor(value) !== index) {
        runOnJS(setIndex)(Math.floor(value));
      }
    }
  );

  const onResponse = (res) => {
    console.log('Response: ', res);
  };

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
      {
        cards.map((card, index) => (
          <Card
            key={card.id}
            img={card.uri}
            numOfCards={cards.length}
            curIndex={index}
            activeIndex={activeIndex}
            onResponse={onResponse}
          />
        ))
      }
    </SafeAreaView>
  )
}

export default App;

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    aspectRatio: 1 / 1.67,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    position: 'absolute',
  },
  image: {
    width: null,
    borderRadius: 12,
  }
});