import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";

// Dimensions artık kullanılmıyor, style içinde yüzde bazlı boyutlar kullanılıyor

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
    <View className="flex-1 bg-[#F7F6EE] justify-center items-center">
      <LottieView
        ref={animationRef}
        source={require("../assets/animations/Open book.json")}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop={false}
        speed={0.7}
        resizeMode="contain"
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};
