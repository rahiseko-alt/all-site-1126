import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let group;
let container, stats;
const particlesData = [];
let camera, scene, renderer;
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;
let pMaterial;

const maxParticleCount = 1000;
let particleCount = 400;
const r = 800;
const rHalf = r / 2;

const colorsMap = {
	'Gold': { r: 1.0, g: 0.85, b: 0.2, point: 0xffdf66 },
	'Electric Blue': { r: 0.4, g: 0.8, b: 1.0, point: 0x8be4ff },
	'Crimson Red': { r: 1.0, g: 0.2, b: 0.3, point: 0xff6677 },
	'Neon Violet': { r: 0.8, g: 0.2, b: 1.0, point: 0xe066ff },
	'Emerald Green': { r: 0.2, g: 1.0, b: 0.5, point: 0x66ff99 },
	'White': { r: 1.0, g: 1.0, b: 1.0, point: 0xffffff },
	'Rainbow (マルチカラー)': { r: -1, g: -1, b: -1, point: 0xffffff }
};

const presets = {
	'Constellations (星座)': {
		showDots: true,
		minDistance: 200, // 2x
		limitConnections: true,
		maxConnections: 4,
		particleCount: 300,
		lightningSteps: 1,
		displacement: 0,
		flashProbability: 1.0,
		colorPattern: 'White',
		lineWidth: 1
	},
	'Blue Electricity (青電流)': {
		showDots: true,
		minDistance: 240, // 2x
		limitConnections: true,
		maxConnections: 2,
		particleCount: 250,
		lightningSteps: 4,
		displacement: 6,
		flashProbability: 1.0,
		colorPattern: 'Electric Blue',
		lineWidth: 1
	},
	'Yellow Electricity (黄電流)': {
		showDots: true,
		minDistance: 240, // 2x
		limitConnections: true,
		maxConnections: 2,
		particleCount: 250,
		lightningSteps: 5,
		displacement: 8,
		flashProbability: 1.0,
		colorPattern: 'Gold',
		lineWidth: 1
	},
	'Random Lightning (ランダム放電)': {
		showDots: false,
		minDistance: 640, // 2x
		limitConnections: true,
		maxConnections: 1,
		particleCount: 200,
		lightningSteps: 5,
		displacement: 8,
		flashProbability: 0.6, // Increased from 0.05
		colorPattern: 'Gold',
		lineWidth: 1
	},
	'Lightning Storm (巨大雷雨)': {
		showDots: false,
		minDistance: 1000, // 2x
		limitConnections: true,
		maxConnections: 1,
		particleCount: 400,
		lightningSteps: 8,
		displacement: 22,
		flashProbability: 0.4, // Increased from 0.003
		colorPattern: 'Gold',
		lineWidth: 2 // Thicker default
	}
};

const effectController = {
	preset: 'Lightning Storm (巨大雷雨)',
	showDots: false,
	showLines: true,
	minDistance: 1000, // 2x
	limitConnections: true,
	maxConnections: 1,
	particleCount: 400,
	lightningSteps: 8,
	displacement: 22,
	flashProbability: 0.4, // Increased from 0.003
	colorPattern: 'Gold',
	particleSpeed: 1.0,
	lineWidth: 2
};

init();

function initGUI() {

	const gui = new GUI({ title: '⚡ Lightning Settings' });

	// 1. Preset Dropdown
	gui.add( effectController, 'preset', Object.keys(presets) ).name('Preset (パターン)').onChange( function ( value ) {

		const preset = presets[ value ];
		if ( preset ) {
			effectController.showDots = preset.showDots;
			effectController.minDistance = preset.minDistance;
			effectController.limitConnections = preset.limitConnections;
			effectController.maxConnections = preset.maxConnections;
			effectController.particleCount = preset.particleCount;
			effectController.lightningSteps = preset.lightningSteps;
			effectController.displacement = preset.displacement;
			effectController.flashProbability = preset.flashProbability;
			effectController.colorPattern = preset.colorPattern;
			effectController.lineWidth = preset.lineWidth;

			// Update UI display
			gui.controllers.forEach( c => {
				if ( c.property !== 'preset' ) c.updateDisplay();
			} );
			// Also update controllers inside folders
			gui.folders.forEach( folder => {
				folder.controllers.forEach( c => c.updateDisplay() );
			} );

			// Apply visibility and draw range immediately
			if ( pointCloud ) pointCloud.visible = effectController.showDots;
			
			particleCount = effectController.particleCount;
			if ( particles ) particles.setDrawRange( 0, particleCount );
		}

	} );

	// 2. Custom controls folder
	const fCustom = gui.addFolder('Custom Tweaks (カスタム微調整)');
	
	fCustom.add( effectController, 'showDots' ).name('Show Nodes (点表示)').onChange( function ( value ) {
		if ( pointCloud ) pointCloud.visible = value;
	} );
	
	fCustom.add( effectController, 'colorPattern', Object.keys(colorsMap) ).name('Color (色パターン)');
	fCustom.add( effectController, 'flashProbability', 0.001, 1.0 ).name('Flash Rate (発生確率)');
	fCustom.add( effectController, 'particleSpeed', 0.1, 4.0, 0.1 ).name('Drift Speed (発生速度)');
	fCustom.add( effectController, 'lightningSteps', 1, 12, 1 ).name('Zigzag Steps (ジグザグ度)');
	fCustom.add( effectController, 'displacement', 0, 50, 0.5 ).name('Displacement (揺れ幅)');
	
	// Standard properties
	fCustom.add( effectController, 'lineWidth', 1, 5, 1 ).name('Line Width (線の太さ)');
	fCustom.add( effectController, 'minDistance', 10, 1000, 10 ).name('Connection Dist (最大距離)');
	fCustom.add( effectController, 'limitConnections' ).name('Limit Connect (接続数制限)');
	fCustom.add( effectController, 'maxConnections', 0, 30, 1 ).name('Max Connections (最大本数)');
	fCustom.add( effectController, 'particleCount', 0, maxParticleCount, 1 ).name('Node Count (点数)').onChange( function ( value ) {
		particleCount = value;
		if ( particles ) particles.setDrawRange( 0, particleCount );
	} );
	
	fCustom.close(); // Close folder by default to keep it clean

}

function init() {

	initGUI();

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
	camera.position.z = 1750;

	const controls = new OrbitControls( camera, container );
	controls.minDistance = 1000;
	controls.maxDistance = 3000;

	scene = new THREE.Scene();


	group = new THREE.Group();
	scene.add( group );

	// BoxHelper disabled to let the sparks loose beyond any bounding box
	/*
	const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );
	helper.material.color.setHex( 0x474747 );
	helper.material.blending = THREE.AdditiveBlending;
	helper.material.transparent = true;
	group.add( helper );
	*/

	const segments = maxParticleCount * maxParticleCount;

	positions = new Float32Array( segments * 3 );
	colors = new Float32Array( segments * 3 );

	pMaterial = new THREE.PointsMaterial( {
		color: 0xffdf66,
		size: 4.5,
		blending: THREE.AdditiveBlending,
		transparent: true,
		sizeAttenuation: false
	} );

	particles = new THREE.BufferGeometry();
	particlePositions = new Float32Array( maxParticleCount * 3 );

	for ( let i = 0; i < maxParticleCount; i ++ ) {

		// Expanded range (2.5x larger) to release nodes inside & outside screen space
		const x = Math.random() * r * 2.5 - (r * 2.5) / 2;
		const y = Math.random() * r * 2.5 - (r * 2.5) / 2;
		const z = Math.random() * r * 2.5 - (r * 2.5) / 2;

		particlePositions[ i * 3 ] = x;
		particlePositions[ i * 3 + 1 ] = y;
		particlePositions[ i * 3 + 2 ] = z;

		// add it to the geometry
		particlesData.push( {
			velocity: new THREE.Vector3( - 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2 ),
			numConnections: 0
		} );

	}

	particles.setDrawRange( 0, particleCount );
	particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

	// create the particle system
	pointCloud = new THREE.Points( particles, pMaterial );
	pointCloud.visible = effectController.showDots;
	group.add( pointCloud );

	const geometry = new THREE.BufferGeometry();

	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
	geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

	geometry.computeBoundingSphere();

	geometry.setDrawRange( 0, 0 );

	const material = new THREE.LineBasicMaterial( {
		vertexColors: true,
		blending: THREE.AdditiveBlending,
		transparent: true
	} );

	linesMesh = new THREE.LineSegments( geometry, material );
	group.add( linesMesh );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	container.appendChild( renderer.domElement );

	//

	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

// HSL to RGB converter helper
function hslToRgb(h, s, l) {
	let r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}
	return { r: r, g: g, b: b };
}

function animate() {

	let vertexpos = 0;
	let colorpos = 0;
	let numConnected = 0;

	for ( let i = 0; i < particleCount; i ++ )
		particlesData[ i ].numConnections = 0;

	for ( let i = 0; i < particleCount; i ++ ) {

		// get the particle
		const particleData = particlesData[ i ];

		particlePositions[ i * 3 ] += particleData.velocity.x * effectController.particleSpeed;
		particlePositions[ i * 3 + 1 ] += particleData.velocity.y * effectController.particleSpeed;
		particlePositions[ i * 3 + 2 ] += particleData.velocity.z * effectController.particleSpeed;

		// Add chaotic random drift to speed vectors (Brownian walk)
		particleData.velocity.x += (Math.random() - 0.5) * 0.15;
		particleData.velocity.y += (Math.random() - 0.5) * 0.15;
		particleData.velocity.z += (Math.random() - 0.5) * 0.15;
		
		// Clamp maximum velocity length to prevent particles flying too fast
		const speedLen = Math.sqrt(
			particleData.velocity.x * particleData.velocity.x + 
			particleData.velocity.y * particleData.velocity.y + 
			particleData.velocity.z * particleData.velocity.z
		);
		if (speedLen > 3.0) {
			particleData.velocity.x *= 3.0 / speedLen;
			particleData.velocity.y *= 3.0 / speedLen;
			particleData.velocity.z *= 3.0 / speedLen;
		}

		// Screen boundary Wrapping: lets nodes fly infinitely out of screen and return from opposite side
		const wrapBound = r * 1.25;
		if ( particlePositions[ i * 3 ] < - wrapBound ) particlePositions[ i * 3 ] = wrapBound;
		else if ( particlePositions[ i * 3 ] > wrapBound ) particlePositions[ i * 3 ] = - wrapBound;

		if ( particlePositions[ i * 3 + 1 ] < - wrapBound ) particlePositions[ i * 3 + 1 ] = wrapBound;
		else if ( particlePositions[ i * 3 + 1 ] > wrapBound ) particlePositions[ i * 3 + 1 ] = - wrapBound;

		if ( particlePositions[ i * 3 + 2 ] < - wrapBound ) particlePositions[ i * 3 + 2 ] = wrapBound;
		else if ( particlePositions[ i * 3 + 2 ] > wrapBound ) particlePositions[ i * 3 + 2 ] = - wrapBound;

		if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
			continue;

		// Check collision
		for ( let j = i + 1; j < particleCount; j ++ ) {

			if ( numConnected >= 1500 ) {
				break;
			}

			const particleDataB = particlesData[ j ];
			if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
				continue;

			const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
			const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
			const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
			const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

			if ( dist < effectController.minDistance ) {

				// Random chance per frame to make lightning flash dynamically based on GUI slider
				if ( Math.random() > effectController.flashProbability ) continue;

				particleData.numConnections ++;
				particleDataB.numConnections ++;

				const alpha = 1.0 - dist / effectController.minDistance;

				// --- Lightning Effect Generation ---
				const p1 = new THREE.Vector3(particlePositions[ i * 3 ], particlePositions[ i * 3 + 1 ], particlePositions[ i * 3 + 2 ]);
				const p2 = new THREE.Vector3(particlePositions[ j * 3 ], particlePositions[ j * 3 + 1 ], particlePositions[ j * 3 + 2 ]);
				
				const steps = effectController.lightningSteps; // Dynamic splits from GUI
				const displacement = effectController.displacement; // Dynamic vibration amplitude from GUI
				const numLines = Math.max(1, Math.round(effectController.lineWidth || 1));
				
				// Resolve active color palette from GUI
				const palette = colorsMap[effectController.colorPattern] || colorsMap['Gold'];
				let isRainbow = palette.r === -1;
				
				let r_col, g_col, b_col;
				if (isRainbow) {
					// Dynamic rainbow colors shifting over time and connection index
					const hue = (Date.now() * 0.0003 + numConnected * 0.005) % 1.0;
					const rgb = hslToRgb(hue, 1.0, 0.5);
					r_col = rgb.r;
					g_col = rgb.g;
					b_col = rgb.b;
					
					if (pMaterial && pMaterial.color.getHex() !== 0xffffff) {
						pMaterial.color.setHex(0xffffff);
					}
				} else {
					r_col = palette.r;
					g_col = palette.g;
					b_col = palette.b;
					
					if (pMaterial && pMaterial.color.getHex() !== palette.point) {
						pMaterial.color.setHex(palette.point);
					}
				}

				let arcFails = false;
				for (let w = 0; w < numLines; w++) {
					let currentPoint = p1.clone();
					
					// Apply random offset to starting point for bundle thickness
					if (w > 0) {
						currentPoint.x += (Math.random() - 0.5) * 2.0 * (w * 0.5);
						currentPoint.y += (Math.random() - 0.5) * 2.0 * (w * 0.5);
						currentPoint.z += (Math.random() - 0.5) * 2.0 * (w * 0.5);
					}
					
					const stepVector = p2.clone().sub(p1).multiplyScalar(1 / steps);
					
					const dir = p2.clone().sub(p1).normalize();
					let up = new THREE.Vector3(0, 1, 0);
					if (Math.abs(dir.dot(up)) > 0.9) {
						up.set(1, 0, 0);
					}
					const right = new THREE.Vector3().crossVectors(dir, up).normalize();
					const vertical = new THREE.Vector3().crossVectors(dir, right).normalize();

					for (let s = 1; s <= steps; s++) {
						const nextPoint = p1.clone().addScaledVector(stepVector, s);
						
						// Apply random zigzag displacement to intermediate vertices
						if (s < steps) {
							const offsetLength = (Math.random() - 0.5) * displacement;
							const offsetLength2 = (Math.random() - 0.5) * displacement;
							nextPoint.addScaledVector(right, offsetLength);
							nextPoint.addScaledVector(vertical, offsetLength2);
						}
						
						// Apply thickness bundling offset to intermediate vertices
						if (w > 0 && s < steps) {
							nextPoint.x += (Math.random() - 0.5) * 2.0 * (w * 0.5);
							nextPoint.y += (Math.random() - 0.5) * 2.0 * (w * 0.5);
							nextPoint.z += (Math.random() - 0.5) * 2.0 * (w * 0.5);
						}

						// Safe buffer boundaries check to prevent Float32Array overflow
						if (vertexpos + 6 >= positions.length) {
							arcFails = true;
							break;
						}

						positions[ vertexpos ++ ] = currentPoint.x;
						positions[ vertexpos ++ ] = currentPoint.y;
						positions[ vertexpos ++ ] = currentPoint.z;

						positions[ vertexpos ++ ] = nextPoint.x;
						positions[ vertexpos ++ ] = nextPoint.y;
						positions[ vertexpos ++ ] = nextPoint.z;

						// High frequency brightness flicker
						const flicker = alpha * (0.3 + Math.random() * 0.7);

						colors[ colorpos ++ ] = flicker * r_col;
						colors[ colorpos ++ ] = flicker * g_col;
						colors[ colorpos ++ ] = flicker * b_col;

						colors[ colorpos ++ ] = flicker * r_col;
						colors[ colorpos ++ ] = flicker * g_col;
						colors[ colorpos ++ ] = flicker * b_col;

						currentPoint.copy(nextPoint);
						numConnected ++;
					}
					if (arcFails) break;
				}
				if (arcFails) break;
			}

		}

	}


	linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
	linesMesh.geometry.attributes.position.needsUpdate = true;
	linesMesh.geometry.attributes.color.needsUpdate = true;

	pointCloud.geometry.attributes.position.needsUpdate = true;

	render();

	stats.update();

}

function render() {

	const time = Date.now() * 0.001;

	group.rotation.y = time * 0.1;
	renderer.render( scene, camera );

}
