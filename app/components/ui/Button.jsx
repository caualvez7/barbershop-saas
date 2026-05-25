export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  const variants = {
    primary: { background: '#1a1a18', color: '#fafaf9', border: 'none' },
    secondary: { background: '#f5f4f0', color: '#1a1a18', border: '0.5px solid #e5e3dd' },
    danger: { background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fca5a5' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: '0.55rem 1.1rem',
        borderRadius: '100px',
        fontSize: '0.875rem',
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity .2s',
        whiteSpace: 'nowrap',
      }}
      className={className}
    >
      {children}
    </button>
  )
}