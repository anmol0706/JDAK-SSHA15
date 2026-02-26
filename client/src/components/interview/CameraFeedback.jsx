import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Suppress known noisy MediaPipe internal WASM logs
const originalWarn = console.warn;
const originalLog = console.log;
const originalInfo = console.info;
const originalError = console.error;

const isNoisyMediaPipeLog = (msg) => {
    if (typeof msg !== 'string') return false;
    return msg.includes('FaceBlendshapesGraph') ||
        msg.includes('OpenGL error checking') ||
        msg.includes('gl_context') ||
        msg.includes('face_landmarker_graph') ||
        msg.includes('XNNPACK delegate') ||
        msg.includes('Created TensorFlow Lite') ||
        msg.includes('Graph successfully started') ||
        msg.includes('Graph finished') ||
        msg.includes('GL_INVALID_FRAMEBUFFER_OPERATION') ||
        msg.includes('Framebuffer is incomplete') ||
        msg.includes('.WebGL');
};

console.warn = (...args) => {
    if (args[0] && isNoisyMediaPipeLog(args.join(' '))) return;
    originalWarn(...args);
};

console.info = (...args) => {
    if (args[0] && isNoisyMediaPipeLog(args.join(' '))) return;
    originalInfo(...args);
};

console.log = (...args) => {
    if (args[0] && isNoisyMediaPipeLog(args.join(' '))) return;
    originalLog(...args);
};

console.error = (...args) => {
    if (args[0] && isNoisyMediaPipeLog(args.join(' '))) return;
    originalError(...args);
};

const CameraFeedback = forwardRef(({ onAnalyticsUpdate, onMisbehavior }, ref) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [error, setError] = useState(null);

    // Status can be: 'good', 'looking-away', 'fidgeting'
    const [status, setStatus] = useState('good');

    // Analytics accumulators
    const metricsRef = useRef({
        framesAssessed: 0,
        framesLookingAtCamera: 0,
        fidgetFrames: 0,
        faceMissingFrames: 0,
        lastFaceCenter: null,
    });

    useImperativeHandle(ref, () => ({
        getAnalytics: () => {
            const m = metricsRef.current;
            if (m.framesAssessed === 0) return { eyeContactScore: 100, postureScore: 100 };

            const eyeContactScore = Math.round((m.framesLookingAtCamera / m.framesAssessed) * 100);
            const postureScore = Math.max(0, 100 - Math.round((m.fidgetFrames / m.framesAssessed) * 100) - Math.round((m.faceMissingFrames / m.framesAssessed) * 100));

            return {
                eyeContactScore: Math.min(100, Math.max(0, eyeContactScore)),
                postureScore: Math.min(100, Math.max(0, postureScore)),
                totalFrames: m.framesAssessed
            };
        },
        resetAnalytics: () => {
            metricsRef.current = {
                framesAssessed: 0,
                framesLookingAtCamera: 0,
                fidgetFrames: 0,
                faceMissingFrames: 0,
                lastFaceCenter: null,
            };
        }
    }));

    useEffect(() => {
        let faceLandmarker;
        let animationFrameId;
        let active = true;
        let stream;

        const initializeTracker = async () => {
            try {
                // Request camera stream
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 }
                });

                if (!active) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCamera(true);
                }

                // Load MediaPipe Face Landmarker
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "CPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                setIsLoaded(true);

                if (active && videoRef.current) {
                    videoRef.current.addEventListener('loadeddata', predictWebcam);
                    if (videoRef.current.readyState >= 2) {
                        predictWebcam();
                    }
                }
            } catch (err) {
                console.error("Camera/MediaPipe Error:", err);
                setError(err.message || "Failed to access camera");
            }
        };

        let lastVideoTime = -1;

        const predictWebcam = () => {
            if (!videoRef.current || !faceLandmarker || !active) return;

            const video = videoRef.current;

            if (video.videoWidth > 0 && video.readyState >= 2) {

                if (lastVideoTime !== video.currentTime) {
                    lastVideoTime = video.currentTime;
                    const startTimeMs = performance.now();
                    let results;
                    try {
                        results = faceLandmarker.detectForVideo(video, startTimeMs);
                    } catch (e) {
                        // Ignore transient errors 
                    }

                    if (results) {
                        metricsRef.current.framesAssessed++;

                        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                            const landmarks = results.faceLandmarks[0];

                            // Basic pose estimation proxy: 
                            // Nose tip is index 1.
                            // Left extreme is 234, Right extreme is 454
                            // Up extreme is 10, Down extreme is 152
                            const nose = landmarks[1];
                            const left = landmarks[234];
                            const right = landmarks[454];

                            // Simple logic for head rotation
                            const faceWidth = Math.abs(right.x - left.x);
                            const centerPoint = (left.x + right.x) / 2;
                            const noseOffset = nose.x - centerPoint;

                            // If nose offset is large relative to faceWidth, looking away
                            let lookingAway = Math.abs(noseOffset) > (faceWidth * 0.15);

                            // Advanced tracking: Pupil/Eye Blendshapes
                            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                                const blendshapes = results.faceBlendshapes[0].categories;
                                const lookOutObj = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft');
                                const lookInObj = blendshapes.find(b => b.categoryName === 'eyeLookInLeft');
                                const lookUpObj = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft');
                                const lookDownObj = blendshapes.find(b => b.categoryName === 'eyeLookDownLeft');

                                if (lookOutObj && lookInObj && lookUpObj && lookDownObj) {
                                    // If eye pupil deviation exceeds 0.5 threshold logic, eyes are wandering
                                    const wanderingEye = (lookOutObj.score > 0.6) || (lookInObj.score > 0.6) || (lookUpObj.score > 0.6) || (lookDownObj.score > 0.6);
                                    if (wanderingEye) {
                                        lookingAway = true;
                                    }
                                }
                            }

                            if (!lookingAway) {
                                metricsRef.current.framesLookingAtCamera++;
                            }

                            // Fidget logic
                            if (metricsRef.current.lastFaceCenter) {
                                const dx = nose.x - metricsRef.current.lastFaceCenter.x;
                                const dy = nose.y - metricsRef.current.lastFaceCenter.y;
                                const movement = Math.sqrt(dx * dx + dy * dy);
                                if (movement > 0.05) { // Rapid movement threshold relative to normalized coords
                                    metricsRef.current.fidgetFrames++;
                                }
                            }
                            metricsRef.current.lastFaceCenter = { x: nose.x, y: nose.y };

                            let currentStatus = 'good';
                            if (lookingAway) {
                                currentStatus = 'looking-away';
                            } else if (metricsRef.current.fidgetFrames > (metricsRef.current.framesAssessed * 0.2)) {
                                currentStatus = 'fidgeting';
                            }

                            setStatus(currentStatus);

                            // Fire misbehavior event if status is bad for ~4 seconds continuously
                            if (currentStatus !== 'good') {
                                if (!metricsRef.current.badBehaviorStart) {
                                    metricsRef.current.badBehaviorStart = performance.now();
                                } else if (performance.now() - metricsRef.current.badBehaviorStart > 4000) {
                                    if (onMisbehavior) onMisbehavior(currentStatus);
                                    metricsRef.current.badBehaviorStart = performance.now(); // Wait another 4s
                                }
                            } else {
                                metricsRef.current.badBehaviorStart = null;
                            }

                        } else {
                            metricsRef.current.faceMissingFrames++;
                            setStatus('looking-away');

                            if (!metricsRef.current.badBehaviorStart) {
                                metricsRef.current.badBehaviorStart = performance.now();
                            } else if (performance.now() - metricsRef.current.badBehaviorStart > 4000) {
                                if (onMisbehavior) onMisbehavior('looking-away');
                                metricsRef.current.badBehaviorStart = performance.now();
                            }
                        }
                    }
                } // End if (lastVideoTime !== video.currentTime)
            } // End if (video.videoWidth > 0 && video.readyState >= 2)

            if (active) {
                animationFrameId = requestAnimationFrame(predictWebcam);
            }
        };

        initializeTracker();

        return () => {
            active = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (videoRef.current) {
                videoRef.current.removeEventListener('loadeddata', predictWebcam);
            }
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
            if (faceLandmarker) {
                try {
                    faceLandmarker.close();
                } catch (e) {
                    console.error("Error closing faceLandmarker:", e);
                }
            }
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 w-1 h-1 overflow-hidden pointer-events-none opacity-5 z-[-100]">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                width={320}
                height={240}
            />
        </div>
    );
});

CameraFeedback.displayName = 'CameraFeedback';
export default CameraFeedback;
