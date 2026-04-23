import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  footer?: ReactNode
  className?: string
  children: ReactNode
}

export function Card({ title, footer, className = '', children }: CardProps) {
  return (
    <div className={`card bg-base-100 shadow-sm border border-base-200 ${className}`}>
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {footer && <div className="card-actions justify-end">{footer}</div>}
      </div>
    </div>
  )
}
