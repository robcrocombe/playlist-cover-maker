import type { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import cx from 'classnames';
import { useState } from 'react';
import { HomeTab } from './HomeTab';
import { Icon } from './Icon';
import { PlaylistTab } from './PlaylistTab';
import { SearchTab } from './SearchTab';

export function NavPanel(): JSX.Element {
  const [tab, setTab] = useState('playlists');
  const [playlist, setPlaylist] = useState<SimplifiedPlaylist>();
  const [input, setInput] = useState('');

  function addPlaylistTab(playlist: SimplifiedPlaylist) {
    setPlaylist(playlist);
    setTab(playlist.name);
  }

  return (
    <div className="search-panel">
      <div className="tabs is-fullwidth is-boxed">
        <ul>
          <li className={cx({ 'is-active': tab === 'playlists' })}>
            <a onClick={() => setTab('playlists')} role="button">
              <span className="icon is-small">
                <Icon icon="music" />
              </span>
              <span>Playlists</span>
            </a>
          </li>
          <li className={cx({ 'is-active': tab === 'search' })}>
            <a onClick={() => setTab('search')} role="button">
              <span className="icon is-small">
                <Icon icon="search" />
              </span>
              <span>Search</span>
            </a>
          </li>
          {playlist && (
            <li className={cx({ 'is-active': tab === playlist.name })}>
              <a onClick={() => setTab(playlist.name)} role="button">
                <span className="icon is-small">
                  <Icon icon="headphones" />
                </span>
                <span className="tab-truncate">{playlist.name}</span>
              </a>
            </li>
          )}
        </ul>
      </div>
      {tab === 'playlists' && <HomeTab addPlaylistTab={addPlaylistTab} />}
      {tab === 'search' && <SearchTab input={input} setInput={setInput} />}
      {tab === playlist?.name && <PlaylistTab playlist={playlist} />}
    </div>
  );
}
