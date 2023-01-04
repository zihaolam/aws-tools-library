import { FC } from "react";

interface PageTitleProps {
    title: string;
    description: string;
    className?: string;
}

const PageTitle: FC<PageTitleProps> = ({ title, description, className }) => (
    <div className={className}>
        <div className="text-3xl font-medium">{title}</div>
        <div className="text-sm text-gray-500 mt-2">{description}</div>
    </div>
);

export default PageTitle;
