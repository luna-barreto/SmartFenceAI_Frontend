/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        verdeOscuro: "#173B1A",
        verdeBosque: "#1F5C26",
        verdeMedio: "#2F7D3A",
        verdeBrillante: "#6FAE3A",
        verdeLima: "#9CD15B",
        verdeLimaSuave: "#E4F2D8",
        crema: "#F5F8F1",
        rojo: "#C9463C",
        rojoSuave: "#FBE8E6",
        naranja: "#C97A1F",
        naranjaSuave: "#FAF0DC",
        azul: "#2F6FA8",
        azulSuave: "#E3F0FA",
        texto: "#152417",
        textoGris: "#5C6B5A",
        textoTenue: "#8A9787",
      },
    },
  },
  plugins: [],
};
