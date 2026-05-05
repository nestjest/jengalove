import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type PixelButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
  }
>

export const PixelButton = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: PixelButtonProps) => (
  <button
    className={`pixel-button pixel-button--${variant} ${className}`}
    type="button"
    {...props}
  >
    {children}
  </button>
)
