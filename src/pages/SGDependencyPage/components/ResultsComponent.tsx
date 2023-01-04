import { FC } from "react";
import { SGDependencyAttributes } from "../forms";
import { FiLink, FiLoader, FiX } from "react-icons/fi";
import exportAsCsv from "utils/exportAsCsv";

const ResultsComponent: FC<{
    show: boolean;
    data?: SGDependencyAttributes[];
    close: () => void;
    loading: boolean;
}> = ({ show, data, close, loading }) => {
    const rows = data
        ?.map((service) =>
            service.dependencies?.map((dependency, index) => ({
                dependencyName: service.dependencyName,
                dependency,
                link: service.links?.[index],
            }))
        )
        .flat();

    return (
        <div className={`${show ? "" : "hidden"}`}>
            <div className="h-screen w-screen bg-gray-500 bg-opacity-50 fixed top-0 left-0 flex flex-col items-center overflow-y-scroll max-h-screen py-5">
                <div className="bg-gray-100 rounded-t-lg w-10/12 text-lg px-4 py-2 items-center flex justify-between">
                    <div className="flex items-center gap-x-3">
                        <span>Results</span>
                        <button
                            className="bg-primary outline-none text-white text-sm px-3 py-1.5 font-semibold focus:bg-opacity-80 disabled:bg-opacity-70 disabled:cursor-not-allowed rounded-lg"
                            onClick={() => exportAsCsv(rows || [])}
                        >
                            Export as CSV
                        </button>
                    </div>
                    <FiX
                        onClick={close}
                        className="text-gray-500 w-6 h-6 cursor-pointer"
                    />
                </div>
                <table className="table p-4 bg-white rounded-b-lg shadow w-10/12">
                    <thead>
                        <tr>
                            <th className="border-b-2 p-4 dark:border-dark-5 text-left whitespace-nowrap font-normal text-gray-900">
                                Service
                            </th>
                            <th className="border-b-2 p-4 dark:border-dark-5 text-left whitespace-nowrap font-normal text-gray-900">
                                Name
                            </th>
                            <th className="border-b-2 p-4 dark:border-dark-5 text-left whitespace-nowrap font-normal text-gray-900">
                                Link
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading ? (
                            rows?.map((row, index) => (
                                <tr className="text-gray-700" key={index}>
                                    <td className="border-b-2 p-4 dark:border-dark-5">
                                        {row?.dependencyName}
                                    </td>
                                    <td className="border-b-2 p-4 dark:border-dark-5">
                                        {row?.dependency}
                                    </td>
                                    <td className="border-b-2 p-4 dark:border-dark-5">
                                        <a
                                            href={row?.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary"
                                        >
                                            <FiLink />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-5">
                                    <FiLoader className="w-8 h-8 animate-spin mx-auto" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsComponent;
