const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={`mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-500/40 transition focus:border-blue-600 focus:ring-2 ${className ?? ''}`}
    />
  )
}
  
  export default Input;
  