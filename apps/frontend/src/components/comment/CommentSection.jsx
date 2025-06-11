// CommentSection.jsx (Commit 1 - All features except socket connection)
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiOutlineLike } from "react-icons/ai";

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [users, setUsers] = useState([]);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!taskId) return;
    fetch(`http://localhost:5002/api/${taskId}/comments`)
      .then((res) => res.json())
      .then(setComments)
      .catch(console.error);
  }, [taskId]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleTextChange = (e) => {
    const input = e.target.value;
    setText(input);

    const atIndex = input.lastIndexOf("@");
    if (atIndex >= 0) {
      const mentionText = input.slice(atIndex + 1).toLowerCase();
      const matches = users.filter((u) =>
        u.name.toLowerCase().startsWith(mentionText)
      );
      setMentionCandidates(matches);
      setShowMentionList(matches.length > 0);
    } else {
      setShowMentionList(false);
    }
  };

  const handleMentionSelect = (user) => {
    const atIndex = text.lastIndexOf("@");
    const newText = text.substring(0, atIndex + 1) + user.name + " ";
    setText(newText);
    setShowMentionList(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !currentUser) return;

    const isEditing = Boolean(editingId);
    const endpoint = isEditing
      ? `http://localhost:5002/api/comments/${editingId}`
      : `http://localhost:5002/api/${taskId}/comments`;

    const mentions = users
      .filter((u) => text.includes("@" + u.name))
      .map((u) => u._id);

    try {
      const formData = new FormData();
      formData.append("author", currentUser.name);
      formData.append("text", text);
      formData.append("parentCommentId", replyTo || "");
      formData.append("mentions", JSON.stringify(mentions));
      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit comment");

      setText("");
      setSelectedFile(null);
      setEditingId(null);
      setReplyTo(null);
    } catch (err) {
      console.error("Error submitting comment:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`http://localhost:5002/api/comments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      console.error("Error deleting comment:", err.message);
    }
  };

  const handleReaction = async (commentId, emoji) => {
    try {
      const res = await fetch(
        `http://localhost:5002/api/comments/${commentId}/reactions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser._id, emoji }),
        }
      );

      if (!res.ok) throw new Error("Failed to react");

      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, reactions: data.reactions } : c
        )
      );
    } catch (err) {
      console.error("Error reacting:", err.message);
    }
  };

  const renderComments = (parentId = null, level = 0) =>
    comments
      .filter((c) => c.parentCommentId === parentId)
      .map((c) => {
        const likeReactions = c.reactions?.filter((r) => r.emoji === "like") || [];
        const hasLiked = likeReactions.some((r) => r.userId === currentUser._id);

        return (
          <div
            key={c._id}
            style={{ marginLeft: level * 20 }}
            className="bg-[#2e2e2e] text-white p-3 rounded-xl mb-2 shadow"
          >
            <div className="font-semibold">
              {users.find((u) => u._id === c.author)?.name || c.author || "Anonymous"}
            </div>

            <div className="text-sm whitespace-pre-wrap">
              {(() => {
                const mentionRegex = /@\w+(?: \w+)?/g;
                const parts = [];
                let lastIndex = 0;
                const matches = [...c.text.matchAll(mentionRegex)];

                for (const match of matches) {
                  const start = match.index;
                  const end = start + match[0].length;

                  if (start > lastIndex) {
                    parts.push(
                      <span key={lastIndex}>{c.text.slice(lastIndex, start)}</span>
                    );
                  }

                  parts.push(
                    <span key={start} className="text-blue-400 font-semibold">
                      {match[0]}
                    </span>
                  );

                  lastIndex = end;
                }

                if (lastIndex < c.text.length) {
                  parts.push(
                    <span key={lastIndex}>{c.text.slice(lastIndex)}</span>
                  );
                }

                return parts;
              })()}
            </div>

            {c.attachment?.url && (
              <div className="mt-2">
                {c.attachment.contentType?.startsWith("image/") ? (
                  <img
                    src={`http://localhost:5002${c.attachment.url}`}
                    alt={c.attachment.filename}
                    className="max-w-xs max-h-48 rounded border"
                  />
                ) : (
                  <a
                    href={`http://localhost:5002${c.attachment.url}`}
                    download
                    className="text-blue-400 underline"
                  >
                    📎 {c.attachment.filename}
                  </a>
                )}
              </div>
            )}

            {c.updatedAt && (
              <div className="text-xs text-gray-400 italic">edited</div>
            )}

            <div className="flex gap-2 mt-2 text-xs text-blue-300 items-center">
              <button
                onClick={() => handleReaction(c._id, "like")}
                className="flex items-center gap-1"
              >
                <AiOutlineLike className={hasLiked ? "text-blue-400" : "text-white"} size={16} />
                {likeReactions.length > 0 && (
                  <span className="text-white">{likeReactions.length}</span>
                )}
              </button>
              {(c.author === currentUser?.name ||
                users.find((u) => u._id === c.author)?.name === currentUser?.name) && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(c._id);
                      setText(c.text);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </>
              )}
              <button
                onClick={() => {
                  setReplyTo(c._id);
                  setText(`@${users.find((u) => u._id === c.author)?.name || c.author} `);
                }}
              >
                Reply
              </button>
            </div>

            {renderComments(c._id, level + 1)}
          </div>
        );
      });

  return (
    <div className="mt-6 relative">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={text}
            onChange={handleTextChange}
            className="w-full p-2 border rounded border-gray-600 bg-[#2e2e2e] text-white"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            {editingId ? "Update" : "Post"}
          </button>
        </div>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mt-1 w-full text-sm text-white bg-[#2e2e2e] border border-gray-600 rounded"
        />
      </div>

      {showMentionList && (
        <div className="absolute bg-[#1e1e1e] border border-gray-600 rounded shadow text-white z-10 w-64 max-h-40 overflow-y-auto">
          {mentionCandidates.map((user) => (
            <div
              key={user._id}
              onClick={() => handleMentionSelect(user)}
              className="cursor-pointer px-3 py-1 hover:bg-gray-700"
            >
              @{user.name}
            </div>
          ))}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto">
        {comments.length ? (
          renderComments()
        ) : (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
