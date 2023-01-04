import { FC } from "react";
import { ToolCards } from "components";

const HomePage: FC = () => {
    return (
        <div className="mt-4">
            <div className="flex">
                <ToolCards.SGDependencyCard />
            </div>
        </div>
    );
};

export default HomePage;
