import { useState, useEffect, useRef } from "react";
import "./App.css";
function pump(reader: ReadableStreamDefaultReader<VideoFrame>) {
  reader.read().then(({ done, value }) => {
    if (done) {
      return;
    }
    console.log(value);
    value.close();
    pump(reader);
  });
}
function App() {
  const [start, setStart] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (start) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        console.log(stream);
        setStream(stream);
      });

      return () => {
        setStream((stream) => {
          stream
            ?.getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
          return null;
        });
      };
    }
  }, [start, setStream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const trackProcessor = new MediaStreamTrackProcessor({
        track: videoTrack,
      });
      const readableStream = trackProcessor.readable;
      const reader = readableStream.getReader();
      pump(reader);
    }
  }, [stream]);

  return (
    <>
      <div className="card">
        <button onClick={() => setStart(true)}>Start</button>
        <button onClick={() => setStart(false)}>Stop</button>
        <video
          autoPlay
          muted
          ref={videoRef}
          style={{
            width: "320px",
            height: "240px",
          }}
        />
      </div>
    </>
  );
}

export default App;
