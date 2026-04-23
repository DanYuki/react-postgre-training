import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="form-control w-full">
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        id={id}
        className={`input input-bordered w-full ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div className="label">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      )}
    </div>
  )
}
