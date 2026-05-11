export default function Card({
  children,
  className = '',
}) {
  return (
    <div
      className={`
        text-black
        ${className}
      `}
    >
      {children}
    </div>
  )
}