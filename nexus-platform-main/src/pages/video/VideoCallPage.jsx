import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMeetings } from "../../context/MeetingContext";
import { Badge } from "../../components/ui/Badge";
import toast from "react-hot-toast";

const VideoCallPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { meetings } = useMeetings();
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera/microphone");
        setIsVideoOn(false);
        setIsMicOn(false);
      }
    };

    startMedia();

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) videoTracks[0].enabled = isVideoOn;
    }
  }, [isVideoOn]);

  useEffect(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) audioTracks[0].enabled = isMicOn;
    }
  }, [isMicOn]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      toast.success("Screen sharing stopped");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      screenStreamRef.current = screenStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }
      setIsScreenSharing(true);
      toast.success("Screen sharing started");

      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
      });
    } catch (err) {
      console.error("Error sharing screen:", err);
      toast.error("Could not share screen");
    }
  };

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    toast.success("Call ended");
    navigate(-1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const meeting = meetings.find((m) => m.type === "video") || null;

  return (
    <div className="flex flex-col items-center py-10 animate-fade-in">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Call Room</h1>
            <p className="text-gray-500 mt-2">Connect securely with your counterpart and share screens live.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Call Time</div>
            <div className="mt-2 text-lg font-bold text-gray-900">{formatTime(callDuration)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {isVideoOn ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-900">
                    <User size={60} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute left-4 bottom-4 rounded-2xl bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">You</div>
              </div>

              <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {isScreenSharing ? (
                  <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-gray-900/80 text-center text-gray-300 px-6">
                    <Monitor size={42} />
                    <div className="text-sm font-semibold">Share your screen to collaborate</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500">No screen share active</div>
                  </div>
                )}
                <div className="absolute left-4 bottom-4 rounded-2xl bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  {isScreenSharing ? "Screen Share" : "Remote Preview"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Session Status</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                    <Video size={14} /> {isVideoOn ? "Video enabled" : "Video off"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                    <Mic size={14} /> {isMicOn ? "Mic enabled" : "Mic muted"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={toggleMic} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${isMicOn ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                  {isMicOn ? <MicOff className="inline mr-2" size={16} /> : <Mic className="inline mr-2" size={16} />} {isMicOn ? "Mute" : "Unmute"}
                </button>
                <button onClick={toggleVideo} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${isVideoOn ? "bg-amber-500 text-white" : "bg-gray-700 text-white"}`}>
                  {isVideoOn ? <VideoOff className="inline mr-2" size={16} /> : <Video className="inline mr-2" size={16} />} {isVideoOn ? "Camera Off" : "Camera On"}
                </button>
                <button onClick={toggleScreenShare} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${isScreenSharing ? "bg-green-600 text-white" : "bg-purple-600 text-white"}`}>
                  {isScreenSharing ? <MonitorOff className="inline mr-2" size={16} /> : <Monitor className="inline mr-2" size={16} />} {isScreenSharing ? "Stop Share" : "Share Screen"}
                </button>
                <button onClick={handleEndCall} className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                  <PhoneOff className="inline mr-2" size={16} /> End Call
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">Meeting Info</p>
                  <h2 className="mt-3 text-xl font-bold text-gray-900">{meeting?.title || "Private Session"}</h2>
                  <p className="mt-2 text-sm text-gray-600">{meeting?.description || "Start a secure call with your investor or founder."}</p>
                </div>
                <Badge variant="secondary">Live</Badge>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Scheduled</p>
                  <p className="mt-2 font-semibold text-gray-900">{meeting?.date || "Today"}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Participant</p>
                  <p className="mt-2 font-semibold text-gray-900">{meeting?.participant || user?.name || "Remote Partner"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Call Notes</h3>
              <p className="mt-3 text-sm text-gray-500 leading-6">
                Take notes during the call, review the agenda, and confirm next-step actions with your counterpart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VideoCallPage };
