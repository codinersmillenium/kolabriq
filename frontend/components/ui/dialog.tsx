import * as Dialog from '@radix-ui/react-dialog'
import React from 'react'

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

const DialogUi: React.FC<DialogProps> = ({ open, onOpenChange, title, content }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
	        position: 'fixed',
	        inset: 0,
	        animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 99
          }}
        />
        <Dialog.Content
          style={{
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-6)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '500px',           
            padding: '25px',
            animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: '10px',
            zIndex: 100
          }}
        >
          <Dialog.Title style={{ marginBottom: '10px', fontWeight: 'bold'}}>{ title }</Dialog.Title>
          <Dialog.Description>
            { content }            
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DialogUi;