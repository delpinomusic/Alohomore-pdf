import { useState } from "react";
import "./App.css";
import { _GSPS2PDF } from "./lib/worker-init.js";

function loadPDFData(response) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", response);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      window.URL.revokeObjectURL(response);
      const blob = new Blob([xhr.response], { type: "application/pdf" });
      const pdfURL = window.URL.createObjectURL(blob);
      resolve({ pdfURL });
    };
    xhr.send();
  });
}

function App() {
  const [state, setState] = useState("init");
  const [file, setFile] = useState(undefined);
  const [downloadLink, setDownloadLink] = useState(undefined);
  const [dragging, setDragging] = useState(false);

  async function unlockPDF(pdf, filename) {
    const dataObject = { psDataURL: pdf };
    const element = await _GSPS2PDF(dataObject);
    const { pdfURL } = await loadPDFData(element);
    setDownloadLink(pdfURL);
    setState("toBeDownloaded");
  }

  const changeHandler = (event) => {
    const f = event.target.files[0];
    if (!f) return;
    const url = window.URL.createObjectURL(f);
    setFile({ filename: f.name, url });
    setState("selected");
  };

  const onSubmit = () => {
    const { filename, url } = file;
    unlockPDF(url, filename);
    setState("loading");
  };

  const reset = () => {
    setFile(undefined);
    setDownloadLink(undefined);
    setState("init");
  };

  const unlockedFileName = file?.filename?.replace(".pdf", "-unlocked.pdf");

  return (
    <div className="page-wrapper">
      <div className="card">

        <div className="header">
          <div className="logo-badge">ALOHOMORE</div>
          <h1>Alohomore PDF</h1>
          <p>Elimina la contraseña de tus PDFs protegidos, directamente en el navegador.</p>
        </div>

        {(state === "init" || state === "selected") && (
          <>
            <div
              className={`upload-zone${dragging ? " dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f && f.type === "application/pdf") {
                  const url = window.URL.createObjectURL(f);
                  setFile({ filename: f.name, url });
                  setState("selected");
                }
              }}
            >
              <input type="file" accept="application/pdf" onChange={changeHandler} />
              <svg className="upload-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              {state === "init" ? (
                <div className="upload-label">
                  <strong>Elige un PDF protegido</strong> o arrástralo aquí
                </div>
              ) : (
                <div className="file-name">{file.filename}</div>
              )}
            </div>

            {state === "selected" && (
              <button className="action-btn primary" onClick={onSubmit}>
                Desbloquear PDF
              </button>
            )}
          </>
        )}

        {state === "loading" && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Desbloqueando…</p>
          </div>
        )}

        {state === "toBeDownloaded" && (
          <div className="download-state">
            <a href={downloadLink} download={unlockedFileName}>
              <button className="action-btn primary">
                Descargar {unlockedFileName}
              </button>
            </a>
            <button className="action-btn ghost" onClick={reset}>
              Desbloquear otro PDF
            </button>
          </div>
        )}

        <div className="privacy-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          El PDF se libera en modo local
        </div>

        <div className="credits">
          Basado en el motor WASM de{" "}
          <a href="https://github.com/ochachacha/ps-wasm" target="_blank" rel="noreferrer">Ochachacha</a>
          {" "}e inspirado en el trabajo de{" "}
          <a href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm" target="_blank" rel="noreferrer">Meyer Laurent</a>.
          {" "}Diseñado por{" "}
          <a href="https://github.com/delpinomusic" target="_blank" rel="noreferrer">Juan del Pino</a>.
        </div>

      </div>
    </div>
  );
}

export default App;
