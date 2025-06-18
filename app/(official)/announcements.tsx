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

export default function BarbellVisualizer() {
  const [targetWeight, setTargetWeight] = useState('');
  const [plateSetup, setPlateSetup] = useState<Plate[]>([]);

  const calculatePlates = (totalWeight: string) => {
    const total = parseFloat(totalWeight);
    if (isNaN(total) || total < BAR_WEIGHT + 2 * COLLAR_WEIGHT) {
      setPlateSetup([]);
      return;
    }

    const sideWeight = (total - BAR_WEIGHT - 2 * COLLAR_WEIGHT) / 2;
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
        {/* Left plates */}
        <View style={styles.plateStack}>
          {plateSetup.map((plate, index) =>
            Array.from({ length: plate.count }).map((_, i) => (
              <Animated.Image
                key={`l-${plate.weight}-${i}`}
                source={plate.image}
                resizeMode="contain"
                style={[styles.plateImage, { zIndex: 100 - index * 2 - i }]}
              />
            ))
          )}
        </View>

        {/* Barbell Image */}
        <Image
          source={require('../../assets/weights/Barbell.png')}
          style={styles.barbellImage}
        />

        {/* Right plates */}
        <View style={styles.plateStack}>
          {plateSetup.map((plate, index) =>
            Array.from({ length: plate.count }).map((_, i) => (
              <Animated.Image
                key={`r-${plate.weight}-${i}`}
                source={plate.image}
                resizeMode="contain"
                style={[styles.plateImage, { zIndex: 100 - index * 2 - i }]}
              />
            ))
          )}
        </View>
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
          Barbell: 20 kg, Collars: 2.5 kg × 2
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white', // ensure background is clean
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
    backgroundColor: 'transparent',
  },
  barbellImage: {
    width: SCREEN_WIDTH * 0.4,
    height: 60,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  plateStack: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  plateImage: {
    width: 36,
    height: 72,
    marginHorizontal: -4,
    backgroundColor: 'transparent',
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
  },
});
