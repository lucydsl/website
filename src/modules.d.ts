declare module 'uslug' {
  export default function uslug(text: string): string;
}

declare module '@lucy/prism' {
  import type Prism from 'prismjs';
  export function lucy(prism: typeof Prism): void;
  export function lucyTemplate(prism: typeof Prism): void;
}
