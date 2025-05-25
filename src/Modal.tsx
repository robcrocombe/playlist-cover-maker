import cx from 'classnames';
import { type PropsWithChildren } from 'react';

interface ModalProps {
  title: string;
  acceptText?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export function Modal({
  title,
  acceptText,
  open,
  setOpen,
  onSuccess,
  children,
}: PropsWithChildren<ModalProps>): JSX.Element {
  return (
    <div className={cx('modal', { 'is-active': open })}>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{title}</p>
          <button className="delete" aria-label="close" onClick={() => setOpen(false)}></button>
        </header>
        <section className="modal-card-body">{children}</section>
        <footer className="modal-card-foot">
          <button
            className="button is-success"
            onClick={() => {
              onSuccess();
              setOpen(false);
            }}>
            {acceptText || 'Accept'}
          </button>
          <button className="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
