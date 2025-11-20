# React Three Fiber Boilerplate

A modern, production-ready starter template for building interactive 3D web experiences with React Three Fiber. This boilerplate combines the power of Three.js with React's component model, providing a solid foundation for creative 3D web projects.

## What is This?

This is a pre-configured development environment that brings together the best tools for building 3D web applications. It eliminates the setup overhead and provides a structured starting point for projects ranging from 3D portfolios and product configurators to interactive data visualizations and web-based games.

## Tech Stack

### Core
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool with HMR for instant feedback during development
- **[React 18](https://react.dev/)** - Component-based UI library for building declarative interfaces
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js, making 3D development feel like writing React components
- **[Three.js](https://threejs.org/)** - The industry-standard WebGL library powering the 3D graphics

### 3D Ecosystem
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Essential helpers and abstractions for R3F (cameras, controls, loaders, effects)
- **[@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)** - Post-processing effects like bloom, depth of field, and color grading
- **[vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl)** - Import GLSL shaders as modules for custom materials and effects

### State & Animation
- **[Zustand](https://github.com/pmndrs/zustand)** - Minimal, fast state management without boilerplate
- **[GSAP](https://greensock.com/gsap/)** - Professional-grade animation library for complex timelines and interactions
- **[Leva](https://github.com/pmndrs/leva)** - GUI controls for tweaking parameters in real-time during development

### Styling & Quality
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for UI overlays and HTML elements
- **[ESLint](https://eslint.org/)** - Code quality and style enforcement with React-specific rules

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone or download this repository
git clone <your-repo-url>
cd r3f-starter

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The development server will start at `http://localhost:5173`

## Project Structure

```
r3f-starter/
├── src/
│   ├── components/        # React & R3F components
│   │   └── Experience.jsx # Main 3D scene component
│   ├── store/            # Zustand state stores
│   │   └── useStore.js   # Example store
│   ├── shaders/          # GLSL shader files (create as needed)
│   ├── utils/            # Helper functions (create as needed)
│   ├── assets/           # 3D models, textures, fonts (create as needed)
│   ├── App.jsx           # Root component with Canvas setup
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles with Tailwind directives
├── public/               # Static assets (create as needed)
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration with GLSL support
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration for Tailwind
└── .eslintrc.cjs         # ESLint rules and settings
```

## Available Scripts

- **`npm run dev`** - Start development server with hot module replacement
- **`npm run build`** - Build optimized production bundle to `dist/`
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## Key Features

### 🎨 Shader Support
Import GLSL shaders directly as ES modules:
```javascript
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
```

### 🎮 Built-in Controls
OrbitControls are set up by default in `Experience.jsx` for easy camera manipulation

### 🎯 Performance Optimized
- Vite's fast bundling and tree-shaking
- React 18's concurrent features
- Automatic code splitting

### 🎨 Styling Flexibility
- Tailwind for UI overlays
- Full access to CSS/SCSS for custom styling
- Easy integration with CSS-in-JS libraries

### 🔧 Developer Experience
- Hot module replacement for instant feedback
- ESLint configuration for code quality
- TypeScript-ready (just rename files to `.tsx`)

## Next Steps

1. **Customize the scene** in `src/components/Experience.jsx`
2. **Add your 3D models** to `src/assets/`
3. **Create shader materials** in `src/shaders/`
4. **Build UI overlays** using React + Tailwind in `src/components/`
5. **Manage app state** with Zustand in `src/store/`

## Recommended Additions

- **[R3F Perf](https://github.com/pmndrs/r3f-perf)** - Performance monitoring overlay
- **[Tunnel Rat](https://github.com/pmndrs/tunnel-rat)** - Render React components outside the Canvas
- **[Maath](https://github.com/pmndrs/maath)** - Math helpers for 3D development
- **[Prettier](https://prettier.io/)** - Code formatting

## Learning Resources

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Drei Examples](https://github.com/pmndrs/drei#examples)
- [PMNDRS Discord Community](https://discord.gg/poimandres)

## License

MIT - Feel free to use this boilerplate for personal or commercial projects.

## Contributing

Issues and pull requests are welcome!