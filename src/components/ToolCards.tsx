import { Link } from "react-router-dom";

export const SGDependencyCard = () => {
    return (
        <Link to="/sg-dependency" className="group">
            <div className="bg-opacity-50 backdrop-filter backdrop-blur bg-gray-100 rounded-lg w-56 group-hover:shadow-xl shadow-sm duration-200">
                <div className="text-xs rounded-t-lg px-3 py-1.5 w-56 bg-secondary bg-opacity-90 text-white font-semibold">
                    Security Groups
                </div>
                <div className="px-3 pt-1.5 pb-4">
                    <div className="font-bold text-secondary tracking-tight">
                        Get SG Dependencies
                    </div>
                    <div className="text-xs mt-1 leading-4 text-secondary">
                        This tool is to find services which are using a specific
                        security group
                    </div>
                </div>
                <div className="text-right">
                    <button className="text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-md mr-2 mb-2 shadow-md hover:ring-offset-1 hover:ring-primary hover:ring-2 duration-200">
                        View
                    </button>
                </div>
            </div>
        </Link>
    );
};
