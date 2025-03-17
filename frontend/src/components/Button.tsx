import { ReactElement } from "react";

interface ButtonInterface {
    text: string;
    startIcon?: ReactElement;
    variant: "primary" | "secondary";
}


const variantClasses = {
    "primary": "bg-purple-600 text-white",
    "secondary": "bg-purple-200 text-purple-600",
}
const defaultStyles = "px-4 py-2 rounded-md font-light flex items-center"
export function Button({ text, startIcon, variant }: ButtonInterface) {
    return <button className={`${variantClasses[variant]} ${defaultStyles}`}>
        <div className="pr-2">
        {startIcon}
        </div>
       
        {text}
    </button>
}
