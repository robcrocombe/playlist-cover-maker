import cx from 'classnames';
import type { CSSProperties } from 'react';
import cancelSvg from './icons/cancel.svg?raw';
import headphonesSvg from './icons/headphones.svg?raw';
import musicSvg from './icons/music.svg?raw';
import searchSvg from './icons/search.svg?raw';

const iconMap = {
  cancel: cancelSvg,
  headphones: headphonesSvg,
  music: musicSvg,
  search: searchSvg,
};

interface IconProps {
  icon: keyof typeof iconMap;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ icon, className, style }: IconProps): JSX.Element | null {
  if (!icon || !iconMap[icon]) {
    return null;
  }

  return (
    <span
      className={cx('svg-icon', className)}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: iconMap[icon] }}
    />
  );
}

// export function PlaylistIcon(): JSX.Element {
//   return (
//     <svg
//       className="inline-icon"
//       aria-hidden="true"
//       dangerouslySetInnerHTML={{ __html: playlistSvg }}
//     />
//   );
// }

// export function SearchIcon(): JSX.Element {
//   return (
//     <svg
//       className="inline-icon"
//       aria-hidden="true"
//       dangerouslySetInnerHTML={{ __html: searchSvg }}
//     />
//   );
// }
