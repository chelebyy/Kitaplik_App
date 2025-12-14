import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
    onAnimationFinish: () => void;
}

export const AnimatedSplash = ({ onAnimationFinish }: AnimatedSplashProps) => {
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        // Animasyonu başlat
        animationRef.current?.play();
    }, []);

    return (
        <View style={styles.container}>
            <LottieView
                ref={animationRef}
                source={require('../assets/animations/Open book.json')}
                style={styles.animation}
                autoPlay
                loop={false}
                speed={0.7}
                resizeMode="contain"
                onAnimationFinish={onAnimationFinish}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Bootsplash ile aynı arka plan rengi - native splash ile eşleşiyor
        backgroundColor: '#F7F6EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: '100%',
        height: '100%',
    },
});
