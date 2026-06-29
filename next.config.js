const path = require("path");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "test02.prowell.co.in",
      },
    ],
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "node_modules")],
    quietDeps: true,
    silenceDeprecations: [
      "mixed-decls",
      "legacy-js-api",
      "import",
      "slash-div",
      "global-builtin",
    ],
  },
};

module.exports = nextConfig;