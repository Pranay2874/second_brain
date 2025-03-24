import { ShareIcon } from "../icons/ShareIcon";
import { Notes } from "../icons/Notes";
import { Bin } from "../icons/Bin";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useContent } from "../hooks/useContent";

interface CardProps {
    id: string;
    title: string;
    link: string;
    type: "twitter" | "youtube";
}

export function Card({ id, title, link, type }: CardProps) {
    const { refresh } = useContent();

    let embedUrl = link;
    if (type === "youtube") {
        embedUrl = link.replace("watch?v=", "embed/").split("&")[0];
    } else if (type === "twitter") {
        embedUrl = link.replace("x.com", "twitter.com");
    }

    const handleDelete = async () => {
        if (!id) {
            console.error("Error: Missing content ID.");
            return;
        }

        try {
            console.log(`Deleting content with ID: ${id}`);
            const response = await axios.delete(`${BACKEND_URL}/api/v1/content`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
                data: { contentId: id }, 
            });

            console.log("Delete response:", response.data);
            refresh(); 
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    return (
        <div className="p-4 bg-white rounded-md border-gray-200 max-w-72 border min-h-48 min-w-72">
            <div className="flex justify-between">
                <div className="flex items-center text-md">
                    <div className="text-gray-500 pr-2">
                        <Notes />
                    </div>
                    {title}
                </div>
                <div className="flex items-center">
                    <div className="pr-2 text-gray-500">
                        <a href={link} target="_blank">
                            <ShareIcon />
                        </a>
                    </div>
                    <div className="text-gray-500 cursor-pointer" onClick={handleDelete}>
                        <Bin />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                {type === "youtube" ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <button className="text-blue-500">Watch on YouTube</button>
                    </a>
                ) : type === "twitter" ? (
                    <blockquote className="twitter-tweet">
                        <a href={embedUrl}></a>
                    </blockquote>
                ) : (
                    <p className="text-gray-400">No preview available</p>
                )}
            </div>
        </div>
    );
}
