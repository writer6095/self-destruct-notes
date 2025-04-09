import React, { useState } from "react";
import { db, doc, setDoc } from "../firebase";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js"; // 🆕 AES encryption
import "./CreateNote.css";

const CreateNote = () => {
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState(60);
  const [viewLimit, setViewLimit] = useState(1);
  const navigate = useNavigate();

  const createNote = async () => {
    if (!note.trim()) return;

    const noteId = uuidv4();
    const expiryTimestamp = Date.now() + expiry * 1000;

    // ✅ Encrypt the note if password is provided
    const encryptedNote = password
      ? CryptoJS.AES.encrypt(note, password).toString()
      : note;

    await setDoc(doc(db, "notes", noteId), {
      content: encryptedNote,
      password: password ? true : null, // flag to indicate encryption
      createdAt: new Date(),
      expiry: expiryTimestamp,
      views: 0,
      viewLimit: viewLimit,
    });

    navigate(`/note/${noteId}`);
  };

  return (
    <div className="form-container">
      <h2>Create a Self-Destructing Note</h2>
      <textarea
        className="form-input"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your secret note..."
        rows={6}
      />
      <input
        className="form-input"
        type="password"
        placeholder="Set Password (Optional)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="form-input"
        type="number"
        placeholder="Expiry Time (seconds)"
        value={expiry}
        onChange={(e) => setExpiry(Number(e.target.value))}
      />
      <input
        className="form-input"
        type="number"
        placeholder="View Limit"
        value={viewLimit}
        onChange={(e) => setViewLimit(Number(e.target.value))}
      />
      <button className="create-button" onClick={createNote}>
        Create Note
      </button>
    </div>
  );
};

export default CreateNote;