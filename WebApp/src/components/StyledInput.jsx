const StyledInput = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 ${className}`}
    {...props}
  />
));

export default StyledInput;