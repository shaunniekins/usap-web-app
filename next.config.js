/** @type {import('next').NextConfig} */

module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/app/match",
        permanent: true,
      },
      {
        source: "/app",
        destination: "/app/match",
        permanent: true,
      },
    ];
  },
};
