import { useEffect } from "react";
import { ShareIcon } from "../icons/ShareIcon";
import { Bin } from "../icons/Bin";
import { Notes } from "../icons/Notes";

interface CardProps {
    title: string;
    link: string;
    type: "twitter" | "youtube";
}


function getYouTubeVideoId(url: string): string | null {
    const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}


function loadTwitterScript() {
    if (!(window as any).twttr) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    }
}

export function Card({ title, link, type }: CardProps) {
    const videoId = getYouTubeVideoId(link);

    useEffect(() => {
        if (type === "twitter") {
            loadTwitterScript();
            setTimeout(() => {
                if ((window as any).twttr) {
                    (window as any).twttr.widgets.load();
                }
            }, 1000);
        }
    }, [link, type]);

    return (
        <div>
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
                            <a href={link} target="_blank" rel="noopener noreferrer">
                                <ShareIcon />
                            </a>
                        </div>
                        <div className="text-gray-500">
                            <Bin />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    
                    {type === "youtube" && videoId ? (
                        <iframe
                            className="w-full h-48"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    ) : type === "youtube" ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Watch on YouTube
                        </a>
                    ) : null}

                
                    {type === "twitter" && (
                        <blockquote className="twitter-tweet">
                            <a href={link}>{link}</a>
                        </blockquote>
                    )}
                </div>
            </div>
        </div>
    );
}