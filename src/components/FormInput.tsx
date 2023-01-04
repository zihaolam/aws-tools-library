import { FieldValues, UseFormRegister, Path } from "react-hook-form";

export interface FormInputProps<T extends FieldValues> {
    register: UseFormRegister<T>;
    name: Path<T>;
    required?: boolean;
    label: string;
    type?: string;
    placeholder?: string;
}

const FormInput = <T extends FieldValues>({
    register,
    name,
    required = false,
    label = "",
    type = "text",
    placeholder,
}: FormInputProps<T>) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-sm">
            {label}
        </label>
        <input
            {...register(name, {
                required: {
                    value: required,
                    message: `${name} is required!`,
                },
            })}
            type={type}
            placeholder={placeholder}
            spellCheck={false}
            name={name}
            className="border border-gray-400 focus:border-blue-400 px-2 text-sm py-2"
        />
    </div>
);

export default FormInput;
