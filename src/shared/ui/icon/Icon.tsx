import type { SVGProps } from 'react';

// Небольшой набор иконок в стиле outline (24×24, stroke = currentColor),
// чтобы не тянуть целую библиотеку ради десятка картинок.
const paths = {
  send: <path d="M4 12 20 4l-6 16-2.5-6.5z M11.5 13.5 20 4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />,
  users: (
    <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.87M16 4.13a3 3 0 0 1 0 5.74" />
  ),
  back: <path d="M15 18l-6-6 6-6" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
  leave: <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h9" />,
  check: <path d="M5 12.5 10 17 19 7" />,
  checks: <path d="M2 12.5 7 17l9-10M12 16l1 1 9-10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  hash: <path d="M5 9h15M4 15h15M10 3 8 21M16 3l-2 18" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" />,
  crown: <path d="M4 18h16M4 15 3 7l5 4 4-6 4 6 5-4-1 8z" />,
  search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" />,
  ban: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8" />,
  message: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5" />,
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
