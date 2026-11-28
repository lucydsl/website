// The demos, in the order the index lists them. Each has a page at
// src/pages/demos/<slug>.astro and its machine in src/demos/<slug>/.
export interface Demo {
  slug: string;
  title: string;
  description: string;
}

export const demos: Demo[] = [
  {
    slug: 'clock',
    title: 'Clock',
    description: 'An analog clock, ported from Solid’s example. An actor sends the machine animation frames, and each frame assigns the hands’ rotations.',
  },
  {
    slug: 'dbmon',
    title: 'DBMon',
    description: 'The classic rendering benchmark: a hundred databases, each with five queries, changing every frame. Every row and every cell is a machine.',
  },
];
