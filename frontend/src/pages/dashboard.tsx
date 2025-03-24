import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreateContentModal } from "../components/CreateContentModal";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Sidebar } from "../components/Sidebar";
import { useContent } from "../hooks/useContent";
import { BACKEND_URL } from "../config";
import axios from "axios";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();

  useEffect(() => {
    refresh();
  }, [modalOpen]);

  return (
    <div>
      <Sidebar />
      <div className="p-4 ml-72 min-h-screen bg-gray-100 border-2">
        <CreateContentModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <div className="flex justify-end gap-4">
          <Button onClick={() => setModalOpen(true)} variant="primary" text="Add content" startIcon={<PlusIcon />} />
          <Button
            onClick={async () => {
              try {
                const response = await axios.post(
                  `${BACKEND_URL}/api/v1/brain/share`,
                  { share: true },
                  {
                    headers: {
                      Authorization: localStorage.getItem("token"),
                    },
                  }
                );

                if (response.status === 200) {
                  const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
                  alert(shareUrl);
                } else {
                  alert("Failed to generate share link.");
                }
              } catch (error) {
                console.error("Error sharing brain:", error);
                alert("An error occurred. Please try again.");
              }
            }}
            variant="secondary"
            text="Share brain"
            startIcon={<ShareIcon />}
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          {Array.isArray(contents) && contents.length > 0 ? (
            contents.map(({ _id, type, link, title }) => (
              <Card key={_id} id={_id} type={type} link={link} title={title} />
            ))
          ) : (
            <p>No content available</p>
          )}
        </div>
      </div>
    </div>
  );
}
