export default function Input({
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full
        border
        border-slate-300
        rounded-xl
        px-4
        py-3
        outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
        transition
        bg-white
        ${className}
      `}
    />
  )
}