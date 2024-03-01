import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "var(--purple)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        darkBlue: "var(--darkBlue)",
        fadedBlue: "var(--fadedBlue)",
        fadedBrown: "var(--fadedBrown)",
        lightGreen: "var(--lightGreen)",
        orangeRed: "var(--orangeRed)",
      },
      backgroundImage: {
        profileHeaderGradient: "var(--profile-header-gradient)",
      },
      fontFamily: {
				poppins: ['var(--font-poppins)'],
			}
    },
  },
  plugins: [],
};
export default config;
