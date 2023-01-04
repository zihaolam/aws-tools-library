import { useForm } from "react-hook-form";

const defaultSGDependencyForm = {
    secretAccessKey: "",
    accessKeyId: "",
    sgIds: "",
    region: "",
};

export type SGDependencyFormValues = typeof defaultSGDependencyForm;

export const useSGDependencyForm = () =>
    useForm<SGDependencyFormValues>({
        defaultValues: defaultSGDependencyForm,
    });

export interface SGDependencyAttributes {
    dependencyName: string;
    dependencies: (string | undefined)[] | undefined;
    links: (string | undefined)[] | undefined;
}
