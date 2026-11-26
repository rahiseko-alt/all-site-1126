// Modified from verbatim: ESM import（type="module" + src/index.mjs）に修正
import { Curtains, Plane } from 'https://cdn.jsdelivr.net/npm/curtainsjs@8.1.3/src/index.mjs';

function generateNoiseTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(256, 256);
    const data = imgData.data;
    
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
            const index = (y * 256 + x) * 4;
            const nx = (x / 256) * Math.PI * 2;
            const ny = (y / 256) * Math.PI * 2;
            const r = Math.floor((Math.sin(nx * 4.0) * Math.cos(ny * 4.0) * 0.5 + 0.5) * 255);
            const g = Math.floor((Math.cos(nx * 4.0) * Math.sin(ny * 4.0) * 0.5 + 0.5) * 255);
            
            data[index] = r;       // R: X displacement
            data[index + 1] = g;   // G: Y displacement
            data[index + 2] = 128; // B: Midpoint
            data[index + 3] = 255; // Alpha
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
}

window.addEventListener("DOMContentLoaded", () => {
    // Inject noise texture into DOM
    const noiseDataUrl = generateNoiseTexture();
    document.querySelectorAll(".displacement-img").forEach(img => {
        img.src = noiseDataUrl;
    });

    // Initialize Curtains via ESM import
    const curtains = new Curtains({
        container: "canvas",
        pixelRatio: Math.min(1.5, window.devicePixelRatio),
        production: true
    });

    curtains.onError(() => {
        document.body.style.background = "#08090d";
        console.warn("WebGL is disabled or unsupported on this environment.");
    });

    const planeElements = document.querySelectorAll(".plane");

    planeElements.forEach((planeElement) => {
        const wrapperElement = planeElement.closest(".card-wrapper");

        const hoverIntensity = parseFloat(wrapperElement.getAttribute("data-hover-intensity") || "1.0");
        const rippleVertexIntensity = parseFloat(wrapperElement.getAttribute("data-ripple-vertex-intensity") || "0.05");
        const rippleFragmentIntensity = parseFloat(wrapperElement.getAttribute("data-ripple-fragment-intensity") || "0.08");
        const rippleEdgeLimit = parseFloat(wrapperElement.getAttribute("data-ripple-edge-limit") || "0.25");
        const rippleEdgeWidth = parseFloat(wrapperElement.getAttribute("data-ripple-edge-width") || "0.15");
        const rippleFrequency = parseFloat(wrapperElement.getAttribute("data-ripple-frequency") || "15.0");
        
        const rect = wrapperElement.getBoundingClientRect();
        const aspect = rect.width / rect.height;
        
        const rippleSpeed = parseFloat(wrapperElement.getAttribute("data-ripple-speed") || "0.01");
        const rippleMaxTime = parseFloat(wrapperElement.getAttribute("data-ripple-max-time") || "120.0");

        let hoverStrength = 0;
        let targetHoverStrength = 0;
        let hoverTime = -1.0;
        let clickTime = -1.0;

        const mousePosition = {
            x: 0.5,
            y: 0.5,
            targetX: 0.5,
            targetY: 0.5
        };

        const clickPosition = {
            x: 0.5,
            y: 0.5
        };

        const params = {
            vertexShaderID: "vs",
            fragmentShaderID: "fs",
            widthSegments: 35,
            heightSegments: 35,
            uniforms: {
                uHoverStrength: { name: "uHoverStrength", type: "1f", value: 0 },
                uMousePosition: { name: "uMousePosition", type: "2f", value: [0.5, 0.5] },
                uHoverTime: { name: "uHoverTime", type: "1f", value: -1.0 },
                uHoverIntensity: { name: "uHoverIntensity", type: "1f", value: hoverIntensity },
                uClickPosition: { name: "uClickPosition", type: "2f", value: [0.5, 0.5] },
                uClickTime: { name: "uClickTime", type: "1f", value: -1.0 },
                uRippleVertexIntensity: { name: "uRippleVertexIntensity", type: "1f", value: rippleVertexIntensity },
                uRippleEdgeLimit: { name: "uRippleEdgeLimit", type: "1f", value: rippleEdgeLimit },
                uRippleEdgeWidth: { name: "uRippleEdgeWidth", type: "1f", value: rippleEdgeWidth },
                uRippleFragmentIntensity: { name: "uRippleFragmentIntensity", type: "1f", value: rippleFragmentIntensity },
                uRippleSpeed: { name: "uRippleSpeed", type: "1f", value: rippleSpeed },
                uRippleMaxTime: { name: "uRippleMaxTime", type: "1f", value: rippleMaxTime },
                uAspect: { name: "uAspect", type: "1f", value: aspect },
                uRippleFrequency: { name: "uRippleFrequency", type: "1f", value: rippleFrequency }
            }
        };

        // Initialize Plane via ESM import
        const cardPlane = new Plane(curtains, planeElement, params);

        cardPlane.onReady(() => {
            wrapperElement.addEventListener("mouseenter", () => {
                targetHoverStrength = 1.0;
                hoverTime = 0.0;
            });

            wrapperElement.addEventListener("mousemove", (e) => {
                const rect = wrapperElement.getBoundingClientRect();
                mousePosition.targetX = (e.clientX - rect.left) / rect.width;
                mousePosition.targetY = (e.clientY - rect.top) / rect.height;
            });

            wrapperElement.addEventListener("mouseleave", () => {
                targetHoverStrength = 0.0;
                mousePosition.targetX = 0.5;
                mousePosition.targetY = 0.5;
            });

            wrapperElement.addEventListener("mousedown", (e) => {
                const rect = wrapperElement.getBoundingClientRect();
                clickPosition.x = (e.clientX - rect.left) / rect.width;
                clickPosition.y = (e.clientY - rect.top) / rect.height;
                cardPlane.uniforms.uClickPosition.value = [clickPosition.x, clickPosition.y];
                clickTime = 0.0;
            });

            wrapperElement.addEventListener("touchstart", (e) => {
                targetHoverStrength = 1.0;
                hoverTime = 0.0;
                const rect = wrapperElement.getBoundingClientRect();
                const touch = e.touches[0];
                mousePosition.targetX = (touch.clientX - rect.left) / rect.width;
                mousePosition.targetY = (touch.clientY - rect.top) / rect.height;
                clickPosition.x = mousePosition.targetX;
                clickPosition.y = mousePosition.targetY;
                cardPlane.uniforms.uClickPosition.value = [clickPosition.x, clickPosition.y];
                clickTime = 0.0;
            }, { passive: true });

            wrapperElement.addEventListener("touchmove", (e) => {
                const rect = wrapperElement.getBoundingClientRect();
                const touch = e.touches[0];
                mousePosition.targetX = (touch.clientX - rect.left) / rect.width;
                mousePosition.targetY = (touch.clientY - rect.top) / rect.height;
            }, { passive: true });

            wrapperElement.addEventListener("touchend", () => {
                targetHoverStrength = 0.0;
            }, { passive: true });

        }).onRender(() => {
            hoverStrength += (targetHoverStrength - hoverStrength) * 0.08;
            cardPlane.uniforms.uHoverStrength.value = hoverStrength;

            if (hoverTime >= 0.0) {
                hoverTime += 1.0;
                if (hoverTime > 100.0) {
                    hoverTime = 100.0;
                }
            }

            if (targetHoverStrength === 0.0 && hoverStrength < 0.01) {
                hoverTime = -1.0;
            }
            cardPlane.uniforms.uHoverTime.value = hoverTime;

            mousePosition.x += (mousePosition.targetX - mousePosition.x) * 0.1;
            mousePosition.y += (mousePosition.targetY - mousePosition.y) * 0.1;
            cardPlane.uniforms.uMousePosition.value = [mousePosition.x, mousePosition.y];

            if (clickTime >= 0.0) {
                clickTime += 1.0;
                if (clickTime > rippleMaxTime) {
                    clickTime = -1.0;
                }
            }
            cardPlane.uniforms.uClickTime.value = clickTime;
        });
    });
});
