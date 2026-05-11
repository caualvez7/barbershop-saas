export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) {

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white',

    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900',

    danger:
      'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-xl
        transition
        font-medium
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}