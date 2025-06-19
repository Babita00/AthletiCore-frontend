import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';

const BAR_WEIGHT = 20;
const COLLAR_WEIGHT = 2.5;
const SCREEN_WIDTH = Dimensions.get('window').width;

type Plate = {
  weight: number;
  image: any;
  count: number;
};

const AVAILABLE_PLATES = [
  { weight: 50, image: require('../../assets/weights/50kg.png') },
  { weight: 25, image: require('../../assets/weights/25kg.png') },
  { weight: 20, image: require('../../assets/weights/20kg.png') },
  { weight: 15, image: require('../../assets/weights/15kg.png') },
  { weight: 10, image: require('../../assets/weights/10kg.png') },
  { weight: 5, image: require('../../assets/weights/5kg.png') },
  { weight: 2.5, image: require('../../assets/weights/2.5kg.png') },
  { weight: 1.5, image: require('../../assets/weights/1.5kg.png') },
  { weight: 1.25, image: require('../../assets/weights/1.25kg.png') },
  { weight: 0.5, image: require('../../assets/weights/0.5kg.png') },
  { weight: 0.25, image: require('../../assets/weights/0.25kg.png') },
];

const COLLAR_IMAGE = require('../../assets/weights/2.5kgcollar.png');
const BARBELL_IMAGE = require('../../assets/weights/Barbell.png');


export default function BarbellVisualizer() {
  const [targetWeight, setTargetWeight] = useState('');
  const [plateSetup, setPlateSetup] = useState<Plate[]>([]);

  const calculatePlates = (totalWeight: string) => {
    const total = parseFloat(totalWeight);
    const fixedWeight = BAR_WEIGHT + 2 * COLLAR_WEIGHT;

    if (isNaN(total) || total < fixedWeight) {
      setPlateSetup([]);
      return;
    }

    const sideWeight = (total - fixedWeight) / 2;
    let remaining = sideWeight;
    const result: Plate[] = [];

    for (const plate of AVAILABLE_PLATES) {
      let count = 0;
      while (remaining >= plate.weight) {
        remaining -= plate.weight;
        count++;
      }
      if (count > 0) {
        result.push({ ...plate, count });
      }
    }

    setPlateSetup(result);
  };

  const renderPlates = (side: 'left' | 'right') => {
    const plateViews = plateSetup.map((plate, index) =>
      Array.from({ length: plate.count }).map((_, i) => (
        <Animated.Image
          key={`${side}-${plate.weight}-${i}`}
          source={plate.image}
          resizeMode="contain"
          style={[styles.plateImage, { zIndex: 100 - index * 2 - i }]}
        />
      ))
    );

    const collar = (
      <Animated.Image
        key={`${side}-collar`}
        source={COLLAR_IMAGE}
        resizeMode="contain"
        style={[styles.plateImage, { zIndex: 1 }]}
      />
    );

    return side === 'left'
      ? [...plateViews.flat(), collar]
      : [collar, ...plateViews.flat()];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Barbell Plate Visualizer</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter total weight (kg)"
        keyboardType="numeric"
        value={targetWeight}
        onChangeText={(text) => {
          setTargetWeight(text);
          calculatePlates(text);
        }}
      />

      <View style={styles.barbellContainer}>
        {/* Left side */}
        <View style={styles.plateStackLeft}>{renderPlates('left')}</View>

        {/* Barbell */}
        <Image source={BARBELL_IMAGE} style={styles.barbellImage} />

        {/* Right side */}
        <View style={styles.plateStackRight}>{renderPlates('right')}</View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total: {targetWeight || 0} kg</Text>
        <Text style={styles.summaryText}>
          Each Side:{' '}
          {targetWeight && !isNaN(parseFloat(targetWeight))
            ? (parseFloat(targetWeight) - BAR_WEIGHT - 2 * COLLAR_WEIGHT) / 2
            : 0}{' '}
          kg
        </Text>
        <Text style={styles.summaryText}>
          Barbell: 20 kg, Collars: 2.5 kg × 2 (always included)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    fontSize: 16,
    marginBottom: 20,
  },
  barbellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  barbellImage: {
    width: SCREEN_WIDTH * 0.4,
    height: 60,
    marginHorizontal: 4,
  },
  plateStackLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  plateStackRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateImage: {
    width: 36,
    height: 72,
    marginHorizontal: -4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    transform: [{ rotate: '-6deg' }],
  },
  summary: {
    marginTop: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    marginVertical: 3,
    color: '#000',
  },
});
