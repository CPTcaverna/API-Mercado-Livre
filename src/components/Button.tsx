type ButtonProps = {
    title: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ title, ...props }: ButtonProps) => {

    return (
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        {...props}
        >
            {title}
        </button>
    );
};

export default Button;
