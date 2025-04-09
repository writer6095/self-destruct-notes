import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, doc, getDoc, deleteDoc, updateDoc } from "../firebase";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CryptoJS from "crypto-js"; // 🆕 Decryption

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [noteMeta, setNoteMeta] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      const noteRef = doc(db, "notes", id);
      const noteSnap = await getDoc(noteRef);

      if (!noteSnap.exists()) {
        setNote(null);
        setLoading(false);
        return;
      }

      const noteData = noteSnap.data();
      setNoteMeta(noteData);

      if (noteData.password) {
        setAuthRequired(true);
        setLoading(false);
        return;
      }

      await proceedToView(noteData, noteRef);
    };

    fetchNote();

    return () => clearInterval(countdownRef.current);
  }, [id, navigate]);

  const startCountdown = (expiryTimestamp, noteRef) => {
    countdownRef.current = setInterval(async () => {
      const remaining = Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        await deleteDoc(noteRef);
        navigate("/");
      }
    }, 1000);
  };

  const proceedToView = async (noteData, noteRef, decryptionPassword = null) => {
    if (Date.now() > noteData.expiry || noteData.views >= noteData.viewLimit) {
      await deleteDoc(noteRef);
      navigate("/");
      return;
    }

    await updateDoc(noteRef, { views: noteData.views + 1 });

    let content = noteData.content;
    if (noteData.password && decryptionPassword) {
      try {
        const bytes = CryptoJS.AES.decrypt(content, decryptionPassword);
        content = bytes.toString(CryptoJS.enc.Utf8);
        if (!content) throw new Error("Decryption failed");
      } catch (err) {
        toast.error("Failed to decrypt the note", { position: "top-center" });
        return;
      }
    }

    setNote(content);
    setQrCode(window.location.href);
    setLoading(false);

    const expiryTimestamp = noteData.expiry;
    startCountdown(expiryTimestamp, noteRef);
  };

  const handlePasswordSubmit = async () => {
    if (!noteMeta) return;

    const noteRef = doc(db, "notes", id);
    setLoading(true);
    await proceedToView(noteMeta, noteRef, password);
    setAuthRequired(false);
  };

  const downloadNote = () => {
    const element = document.createElement("a");
    const file = new Blob([note], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "self-destruct-note.txt";
    document.body.appendChild(element);
    element.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="container fade-in">
      <ToastContainer />
      {loading ? (
        <p>Loading...</p>
      ) : authRequired ? (
        <div>
          <h3>This note is password protected.</h3>
          <motion.input
            type="password"
            placeholder="Enter password"
            value={password}
            className={shake ? "shake" : ""}
            onChange={(e) => setPassword(e.target.value)}
            animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          />
          <button onClick={handlePasswordSubmit}>Unlock Note</button>
        </div>
      ) : note ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h3>{note}</h3>
          {timeLeft !== null && (
            <p style={{ marginTop: "10px", color: "red" }}>
              ⏳ This note will expire in {formatTime(timeLeft)}
            </p>
          )}
          {qrCode && <QRCodeCanvas value={qrCode} />}
          <button onClick={downloadNote}>📥 Download Note</button>
        </motion.div>
      ) : (
        <p>Note not found or already deleted.</p>
      )}
    </div>
  );
};

export default ViewNote;