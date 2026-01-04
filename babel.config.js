module.exports = function (api) {
  api.cache(true);

  // Production build'de console.log'ları kaldır (error ve warn hariç)
  const removeConsolePlugin =
    process.env.NODE_ENV === "production"
      ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
      : [];

  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel", ...removeConsolePlugin],
  };
};
