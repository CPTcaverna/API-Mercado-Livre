const Input = (
    props:
      | React.InputHTMLAttributes<HTMLInputElement>
      | React.InputHTMLAttributes<HTMLInputElement>,
  ) => {
    return (
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500/40 transition focus:border-blue-600 focus:ring-2"
      />
    );
  };
  
  export default Input;
  