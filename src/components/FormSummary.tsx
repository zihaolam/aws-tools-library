import { FC } from "react";
import { Control, useWatch } from "react-hook-form";

interface FormSummaryProps {
    control: Control;
}

const FormSummary: FC<FormSummaryProps> = ({ control }) => {
    const formValues = useWatch({ control });
    return <div></div>;
};

export default FormSummary;
