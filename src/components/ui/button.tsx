import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
        secondary: 'border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-110',
        ghost: 'text-[var(--foreground)] hover:bg-[var(--secondary)]',
        outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--secondary)]',
        destructive: 'bg-[var(--destructive)] text-white hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size, variant, ...props },
  ref,
) {
  return <button ref={ref} className={cn(buttonVariants({ className, size, variant }))} {...props} />
})

export { Button }
