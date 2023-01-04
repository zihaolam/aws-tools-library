import { Outlet, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components";
import { HomePage, SGDependencyPage } from "./pages";
import { FC } from "react";

const Layout: FC = () => {
    return (
        <div className="flex flex-col">
            <Navbar />
            <div className="flex-1 px-10 py-3">
                <Outlet />
            </div>
        </div>
    );
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/sg-dependency", element: <SGDependencyPage /> },
        ],
    },
]);

export default router;
