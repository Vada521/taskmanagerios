declare module '@headlessui/react' {
  import { ComponentProps, ElementType, ReactNode } from 'react';

  export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    children?: ReactNode;
  }

  export const Switch: (props: SwitchProps) => JSX.Element;

  export interface DialogProps {
    open: boolean;
    onClose: () => void;
    className?: string;
    children?: ReactNode;
  }

  export const Dialog: {
    (props: DialogProps): JSX.Element;
    Panel: (props: { className?: string; children?: ReactNode }) => JSX.Element;
    Title: (props: { className?: string; children?: ReactNode }) => JSX.Element;
  };
} 