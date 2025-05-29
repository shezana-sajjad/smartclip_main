import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// Fix the import path for OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const VideoEditorHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x9b87f5, 1);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    // Create video screen
    const screenGeometry = new THREE.PlaneGeometry(3, 1.7, 1);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x444444,
      emissive: 0x222222,
      specular: 0x777777,
      shininess: 30
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0, 0);
    scene.add(screen);
    
    // Add timeline bar
    const timelineGeometry = new THREE.BoxGeometry(3, 0.2, 0.05);
    const timelineMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      emissive: 0x111111
    });
    const timeline = new THREE.Mesh(timelineGeometry, timelineMaterial);
    timeline.position.set(0, -1.2, 0);
    scene.add(timeline);
    
    // Add clip markers to timeline
    const clipColors = [0x8B5CF6, 0xD946EF, 0xF97316, 0x0EA5E9];
    for (let i = 0; i < 4; i++) {
      const clipWidth = Math.random() * 0.5 + 0.2;
      const clipGeometry = new THREE.BoxGeometry(clipWidth, 0.15, 0.1);
      const clipMaterial = new THREE.MeshPhongMaterial({ 
        color: clipColors[i % clipColors.length],
        emissive: clipColors[i % clipColors.length],
        emissiveIntensity: 0.3
      });
      const clip = new THREE.Mesh(clipGeometry, clipMaterial);
      clip.position.set(-1.4 + i * 0.8, -1.2, 0.08);
      scene.add(clip);
    }
    
    // Add playhead
    const playheadGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.15);
    const playheadMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const playhead = new THREE.Mesh(playheadGeometry, playheadMaterial);
    playhead.position.set(-0.5, -1.2, 0.1);
    scene.add(playhead);
    
    // Add floating editing controls (circular buttons)
    const buttonRadius = 0.15;
    const buttonGeometry = new THREE.SphereGeometry(buttonRadius, 16, 16);
    
    const buttonMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x9b87f5, emissive: 0x9b87f5, emissiveIntensity: 0.3 }),
      new THREE.MeshPhongMaterial({ color: 0xD946EF, emissive: 0xD946EF, emissiveIntensity: 0.3 }),
      new THREE.MeshPhongMaterial({ color: 0xF97316, emissive: 0xF97316, emissiveIntensity: 0.3 })
    ];
    
    // Create floating buttons
    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterials[i]);
      const angle = (Math.PI * 2 / 3) * i;
      
      // Position buttons around the top-right of the screen
      button.position.set(
        1.5 + Math.cos(angle) * 0.4,
        0.8 + Math.sin(angle) * 0.4,
        0.3
      );
      scene.add(button);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate playhead
      playhead.position.x = Math.sin(Date.now() * 0.001) * 1.3;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);
  
  return <div ref={mountRef} className="w-full h-[500px] md:h-[600px]" />;
};

export default VideoEditorHero;
