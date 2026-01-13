const removeConsolePlugin = [];

// Only remove console logs in production
if (process.env.NODE_ENV === "production") {
  removeConsolePlugin.push("transform-remove-console");
}

module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "babel-plugin-react-compiler", // Otomatik memoization için
      "react-native-reanimated/plugin", // Her zaman son olmalı
      ...removeConsolePlugin,
    ],
  };
};
