import { FC } from "react";
import { Link } from "react-router-dom";

const Navbar: FC = () => {
    return (
        <div className="bg-secondary">
            <div className="container px-10 h-14">
                <Link className="flex items-center h-full" to="/">
                    <img
                        src={require("assets/aws_logo.png")}
                        alt="AWS Logo"
                        className="h-5"
                    />
                    <div className="text-white ml-7 text-xl font-medium">
                        Tool Library
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
