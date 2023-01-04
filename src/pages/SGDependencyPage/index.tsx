import { AWSHelper } from "utils/getSGDependencies";
import { FC, useState } from "react";
import {
    useSGDependencyForm,
    SGDependencyFormValues,
    SGDependencyAttributes,
} from "./forms";
import { BreadCrumbs, FormGroup, FormInput, PageTitle } from "components";
import { routePaths } from "routeConstants";
import { useMutation } from "react-query";
import ResultsComponent from "./components/ResultsComponent";

const SGDependencyPage: FC = () => {
    const { register, handleSubmit } = useSGDependencyForm();
    const [showResults, setShowResults] = useState<boolean>(false);

    const {
        mutate: submit,
        data,
        isLoading,
    } = useMutation(
        async ({
            secretAccessKey,
            accessKeyId,
            region,
            sgIds,
        }: SGDependencyFormValues) => {
            setShowResults(true);

            const awsHelper = new AWSHelper({
                secretAccessKey,
                accessKeyId,
                region,
            });

            const sgIdList = sgIds.split(",");
            const sgDependencies = await Promise.all(
                sgIdList.map((sgId) =>
                    awsHelper.getSGDependencies(sgId).then((sgDependencies) =>
                        sgDependencies.map((sgDependency) => ({
                            ...sgDependency,
                            sgId,
                        }))
                    )
                )
            ).then((res) => res.flat());

            window.scrollTo(0, 0);

            return sgDependencies as SGDependencyAttributes[];
        }
    );

    return (
        <main className="pb-8">
            <div className="text-left">
                <BreadCrumbs
                    className="mt-2"
                    routes={[routePaths.HOME, routePaths.SG_DEPENDENCY_PAGE]}
                    activePath={routePaths.SG_DEPENDENCY_PAGE.path}
                />
            </div>
            <PageTitle
                className="mt-8"
                title="Find security group dependencies"
                description="This tool helps you to find services which are using a
                    specific security group, by searching in your AWS Account
                    based on a the specific security group id."
            />
            <form
                className="mt-4"
                onSubmit={handleSubmit((data) => submit(data))}
            >
                <div className="flex flex-col space-y-5">
                    <FormGroup
                        title="Account Keys"
                        inputs={
                            <>
                                <FormInput
                                    register={register}
                                    name="accessKeyId"
                                    label="AWS Access Key ID"
                                    required
                                    type="text"
                                />
                                <FormInput
                                    register={register}
                                    name="secretAccessKey"
                                    label="AWS Access Secret"
                                    required
                                    type="password"
                                />
                                <FormInput
                                    register={register}
                                    name="region"
                                    label="Region"
                                    required
                                    type="text"
                                />
                            </>
                        }
                    />

                    <FormGroup
                        title="Security Group"
                        inputs={
                            <>
                                <FormInput
                                    register={register}
                                    name="sgIds"
                                    label="Security Group Ids"
                                    required
                                    placeholder="Security group ids delimited by comma (eg: sg-0192312,sg-1203120)"
                                />
                            </>
                        }
                    />
                </div>
                <div className="mt-8 text-right">
                    <button
                        className="bg-primary outline-none text-white text-sm px-5 py-2 font-semibold rounded-sm focus:bg-opacity-80 disabled:bg-opacity-70 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Find Dependencies
                    </button>
                </div>
            </form>

            <ResultsComponent
                show={showResults}
                loading={isLoading}
                data={data}
                close={() => setShowResults(false)}
            />
        </main>
    );
};

export default SGDependencyPage;
