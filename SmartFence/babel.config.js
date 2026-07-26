module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@screens": "./src/screens",
            "@components": "./src/components",
            "@navigation": "./src/navigation",
            "@services": "./src/services",
            "@hooks": "./src/hooks",
            "@context": "./src/context",
            "@styles": "./src/styles",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@notifications": "./src/notifications",
            "@assets": "./src/assets",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
