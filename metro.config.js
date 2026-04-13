const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * React Native 0.81+ only ships ReactDevToolsSettingsManager.ios.js / .android.js.
 * Metro sometimes fails to apply platform extensions to this relative require from
 * Libraries/Core/setUpReactDevTools.js, which breaks bundling with "Unable to resolve".
 */
const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const normalized = String(moduleName).replace(/\\/g, "/");
  const isDevToolsSettingsBase =
    normalized.endsWith("/rndevtools/ReactDevToolsSettingsManager") ||
    normalized.endsWith("rndevtools/ReactDevToolsSettingsManager") ||
    normalized.endsWith(
      "src/private/devsupport/rndevtools/ReactDevToolsSettingsManager"
    ) ||
    normalized.includes(
      "devsupport/rndevtools/ReactDevToolsSettingsManager"
    );
  const isAlreadyPlatform =
    /\.(ios|android|native)\.js$/.test(normalized) ||
    normalized.includes("ReactDevToolsSettingsManager.ios") ||
    normalized.includes("ReactDevToolsSettingsManager.android");

  if (isDevToolsSettingsBase && !isAlreadyPlatform) {
    const reactNativeRoot = path.dirname(
      require.resolve("react-native/package.json")
    );
    const ext = platform === "android" ? "android" : "ios";
    const filePath = path.join(
      reactNativeRoot,
      "src",
      "private",
      "devsupport",
      "rndevtools",
      `ReactDevToolsSettingsManager.${ext}.js`
    );
    return { filePath, type: "sourceFile" };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
