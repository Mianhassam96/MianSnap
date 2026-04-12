import React, { useRef, useState } from 'react'
import useStore from '../store/useStore'
import { extractFrames } from '../utils/frameExtractor'

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12, height: '100%' },
  dropzone: {
    border: '2px dashed #333',
    borderRadius: 12,
    padding: 32,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    background: '#111118',
  },
  dropzoneHover: { borderColor: '#7c3aed' },
  label: { fontSize: 13, color: '#888', marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, overflowY: 'auto' },
  thumb: {
    aspectRatio: '16/9',
    objectFit: 'cover',
    borderRadius: 6,
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'border-color 0.15s',
  },
  thumbActive: { borderColor: '#7c3aed' },
  progress: { color: '#7c3aed', fontSize: 13, textAlign: 'center', padding: 12 },
}

export default function VideoFramePicker() {
  const { setVideoFile, frames, setFrames, selectedFrame, setSelectedFrame, setActivePanel } = useStore()
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoFile(file)
    setLoading(true)
    const extracted = await extractFrames(URL.createObjectURL(file), 12)
    setFrames(extracted)
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setHover(false)
    handleFile(e.dataTransfer.files[0])
  }

  function selectFrame(frame) {
    setSelectedFrame(frame)
    setActivePanel('packs')
  }

  return (
    <div style={styles.wrap}>
      <div
        style={{ ...styles.dropzone, ...(hover ? styles.dropzoneHover : {}) }}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setHover(true) }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
      >
        <div style={{ fontSize: 28 }}>🎬</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>Drop video or click to upload</div>
        <div style={styles.label}>MP4, MOV, WebM supported</div>
        <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {loading && <div style={styles.progress}>Extracting frames...</div>}

      {frames.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: '#666' }}>Pick a frame to edit</div>
          <div style={styles.grid}>
            {frames.map((f, i) => (
              <img
                key={i}
                src={f.dataUrl}
                alt={`Frame at ${f.time}s`}
                style={{ ...styles.thumb, ...(selectedFrame?.time === f.time ? styles.thumbActive : {}) }}
                onClick={() => selectFrame(f)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
