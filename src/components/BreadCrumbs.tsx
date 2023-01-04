import { Link } from "react-router-dom";
import { useMatch } from "react-router-dom";
import { FC, Fragment } from "react";
import { routePaths } from "routeConstants";

interface BreadCrumbsRouteProps {
    name: string;
    path: string;
}

const BreadCrumbs: FC<{
    routes: BreadCrumbsRouteProps[];
    className?: string;
    activePath: string;
}> = ({ routes, activePath, className }) => {
    const isHomeRoute = useMatch(routePaths.HOME.path);

    const isActive = useMatch(activePath);

    return isHomeRoute ? null : (
        <div className={`flex items-center gap-2 ${className}`}>
            {routes.map(({ name, path }, index) => (
                <Fragment key={index}>
                    <Link
                        to={path}
                        className={`${
                            isActive && path === isActive.pathname
                                ? "text-gray-600 font-semibold"
                                : "text-primary hover:underline"
                        }`}
                    >
                        {name}
                    </Link>
                    {index !== routes.length - 1 && ">"}
                </Fragment>
            ))}
        </div>
    );
};

export default BreadCrumbs;
