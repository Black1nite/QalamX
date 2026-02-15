import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw, Check } from 'lucide-react';
import { compressImage, fileToBase64 } from '../utils/fileHelpers';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen && !stream && !capturedImage) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      if (stream) stopCamera();
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please check permissions.");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame to canvas
        if (facingMode === 'user') {
            // Mirror effect for selfie
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        
        // Convert to base64 immediately
        // Quality 0.8 jpeg for balance
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      const base64 = capturedImage.split(',')[1];
      onCapture(base64);
      onClose();
      setCapturedImage(null);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full">
          <X size={24} />
        </button>
        <span className="text-white font-medium">Capture</span>
        <div className="w-10" /> 
      </div>

      {/* Main View */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`max-w-full max-h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="h-32 bg-black/80 backdrop-blur-sm flex items-center justify-around px-8 pb-8 pt-4">
        {capturedImage ? (
          <>
            <button onClick={retake} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
              <RefreshCw size={24} />
            </button>
            <button onClick={confirmImage} className="p-6 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform transition-transform active:scale-95">
              <Check size={32} />
            </button>
          </>
        ) : (
          <>
            <button onClick={switchCamera} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
              <RefreshCw size={24} />
            </button>
            <button 
                onClick={handleCapture} 
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1"
            >
                <div className="w-full h-full bg-white rounded-full transition-transform active:scale-90" />
            </button>
            <div className="w-14" /> {/* Spacer */}
          </>
        )}
      </div>
    </div>
  );
};

export default CameraModal;