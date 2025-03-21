/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        noto: ["Noto Sans Thai", "sans-serif"],
      },
      keyframes: {
        wave: {
          "0%, 40%, 100%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        wave: "wave 1.5s infinite",
      },
      height: {
        "screen-navbar": "calc(100vh - 124px)",
        "screen-website": "calc(100vh - 0px)",
      },
    },
  },
  plugins: [],
};
