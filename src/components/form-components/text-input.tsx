interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type: string;
  errors?: string[];
  defaultValue?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  label,
  type,
  errors,
  defaultValue,
}) => (
  <div className="relative z-0 w-full mb-5 group">
    <input
      type={type}
      name={name}
      id={id}
      defaultValue={defaultValue}
      className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-trinidad-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-trinidad-600"
      placeholder=" "
      required
    />
    <label
      htmlFor={id}
      className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-trinidad-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-trinidad-600"
    >
      {label}
    </label>
    <div aria-live="polite" aria-atomic="true">
      {errors?.map((error: string) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </div>
  </div>
);

export default TextInput;
