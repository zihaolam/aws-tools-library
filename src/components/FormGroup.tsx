import { FC, ReactNode } from "react";

interface FormGroupProps {
    inputs: ReactNode;
    title: string;
}

const FormGroup: FC<FormGroupProps> = ({ inputs, title }) => {
    return (
        <div className="border-x border-gray-200 border-b">
            <div className="py-5 px-5 bg-gray-100 font-semibold text-lg border-gray-100">
                {title}
            </div>
            <div className="flex flex-col px-5 pt-4 pb-5 gap-y-4">{inputs}</div>
        </div>
    );
};

export default FormGroup;
