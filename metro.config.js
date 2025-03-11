const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add react-native-svg-transformer for SVG support
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts.push("svg");
config.resolver.sourceExts.push("svg");

module.exports = withNativeWind(config, { input: "./global.css" });
