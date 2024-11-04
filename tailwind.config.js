// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure Tailwind processes files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "aqua", "night",  "dracula"],
    darkTheme: "night",
    logs: false, // Specify the themes you want to use
  },
}
