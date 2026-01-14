import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function OffersCarousel({ offers }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!offers?.length) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, offers]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          // 1. Outer Container: Takes full screen width to ensure paging works
          <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
            
            {/* 2. Inner Card: Calculates width based on screen size minus margins */}
            <View style={[styles.card, { width: width - 40 }]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.description}</Text>
            </View>

          </View>
        )}
      />

      <View style={styles.dots}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFE0B2',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    // 3. This forces the card to be a Square (Height = Width)
    aspectRatio: 1, 
    // 4. Center content inside the square
    justifyContent: 'center',
    alignItems: 'center', 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    color: '#5D4037',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15, // Increased slightly for spacing below the square
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF9800',
  },
});