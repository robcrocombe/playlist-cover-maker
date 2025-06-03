import cx from 'classnames';
import { Fragment, type PropsWithChildren } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  actions: JSX.Element[];
}

export function Modal({
  title,
  open,
  setOpen,
  actions,
  children,
}: PropsWithChildren<ModalProps>): JSX.Element {
  return (
    <div className={cx('modal', { 'is-active': open })}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{title}</p>
          <button
            className="modal-cancel-btn delete is-size-5"
            aria-label="close"
            onClick={() => setOpen(false)}>
            <Icon icon="cancel" />
          </button>
        </header>
        <section className="modal-card-body">{children}</section>
        <footer className="modal-card-foot gap-1h">
          {actions.map((action, index) => (
            <Fragment key={index}>{action}</Fragment>
          ))}
        </footer>
      </div>
    </div>
  );
}
