type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'danger' };
export function Button({ variant='primary', className='', ...props }: Props) {
  const base = "px-4 py-2 rounded-xl text-sm font-semibold transition";
  const map = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  } as const;
  return <button className={[base, map[variant], className].join(' ')} {...props} />;
}
