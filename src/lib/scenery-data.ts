import type { SceneryId } from "../types/meanwhile";
import rainyWindow from "../assets/scene-rainy-window.jpg";
import countrysideDusk from "../assets/scene-countryside-dusk.jpg";
import springGarden from "../assets/scene-spring-garden.jpg";
import cloudySeaside from "../assets/scene-cloudy-seaside.jpg";
import quietLibrary from "../assets/scene-quiet-library.jpg";
import starryNight from "../assets/scene-starry-night.jpg";

export const SCENERY_INFO: Record<SceneryId, { name: string; subtitle: string; image: string }> = {
  "rainy-window": {
    name: "Rainy Window",
    subtitle: "A rainy afternoon beside the glass",
    image: rainyWindow,
  },
  "countryside-dusk": {
    name: "Countryside Dusk",
    subtitle: "Quiet hills in late afternoon light",
    image: countrysideDusk,
  },
  "spring-garden": {
    name: "Spring Garden",
    subtitle: "A gentle courtyard in blooming season",
    image: springGarden,
  },
  "cloudy-seaside": {
    name: "Cloudy Seaside",
    subtitle: "Distant waves under soft overcast skies",
    image: cloudySeaside,
  },
  "quiet-library": {
    name: "Quiet Library",
    subtitle: "Tall wooden shelves and warm amber lamps",
    image: quietLibrary,
  },
  "starry-night": {
    name: "Starry Night",
    subtitle: "A quiet midnight under indigo constellations",
    image: starryNight,
  },
};
