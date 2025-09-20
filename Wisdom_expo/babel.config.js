const nativewind = require("nativewind/babel");

module.exports = function (api) {
  api.cache(true);

  const nativewindConfig = nativewind();
  const nativewindPlugins = Array.isArray(nativewindConfig?.plugins)
    ? [...nativewindConfig.plugins]
    : [];

  const findPluginIndex = (plugins, name) =>
    plugins.findIndex(
      (plugin) =>
        plugin === name ||
        (Array.isArray(plugin) && plugin[0] === name)
    );

  const workletsIndex = findPluginIndex(
    nativewindPlugins,
    "react-native-worklets/plugin"
  );

  const plugins = [...nativewindPlugins];

  if (workletsIndex === -1) {
    plugins.push("react-native-worklets/plugin");
  }

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins,
  };
};