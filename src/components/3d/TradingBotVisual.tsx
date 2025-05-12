
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// Fix import path for OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface TradingBotVisualProps {
  performance?: {
    winRate: number;
    profit: number;
  };
  className?: string;
}

const TradingBotVisual: React.FC<TradingBotVisualProps> = ({ 
  performance = { winRate: 75, profit: 1240 },
  className
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
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
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10;
    controls.minDistance = 3;
    controls.enablePan = false;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a circular profit graph
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    
    // Base circle
    const baseGeometry = new THREE.TorusGeometry(2, 0.05, 16, 100);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.7
    });
    const baseCircle = new THREE.Mesh(baseGeometry, baseMaterial);
    graphGroup.add(baseCircle);
    
    // Progress circle (based on win rate)
    const progressGeometry = new THREE.TorusGeometry(
      2, 0.15, 16, 100, Math.PI * 2 * (performance.winRate / 100)
    );
    const progressMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0.9,
      emissive: 0x0066cc,
      emissiveIntensity: 0.2
    });
    const progressCircle = new THREE.Mesh(progressGeometry, progressMaterial);
    progressCircle.rotation.z = -Math.PI / 2; // Start from top
    graphGroup.add(progressCircle);
    
    // Add floating bars representing profit
    const createProfitBar = (height: number, position: THREE.Vector3, color: number) => {
      const barGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
      const barMaterial = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        emissive: color,
        emissiveIntensity: 0.1
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.copy(position);
      return bar;
    };
    
    // Create floating profit bars
    const barGroup = new THREE.Group();
    const numBars = 8;
    const profitNormalized = performance.profit / 1000; // Normalize for better visualization
    
    for (let i = 0; i < numBars; i++) {
      const angle = (i / numBars) * Math.PI * 2;
      const height = 0.5 + Math.random() * profitNormalized;
      const radius = 1.2;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, height / 2, z);
      
      const isProfit = Math.random() > 0.25; // 75% win rate
      const color = isProfit ? 0x10b981 : 0xef4444;
      
      const bar = createProfitBar(height, position, color);
      barGroup.add(bar);
    }
    
    graphGroup.add(barGroup);
    
    // Add a small sphere in the center representing the trading bot
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066cc,
      emissive: 0x0066cc,
      emissiveIntensity: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    graphGroup.add(sphere);
    
    // Add lines connecting the sphere to the bars
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0.3
    });
    
    barGroup.children.forEach(bar => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        bar.position
      ]);
      const line = new THREE.Line(geometry, lineMaterial);
      graphGroup.add(line);
    });
    
    // Animation loop
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotate the graph slowly
      graphGroup.rotation.y += 0.003;
      
      // Make bars "pulse" slightly
      barGroup.children.forEach((bar, index) => {
        const mesh = bar as THREE.Mesh;
        const scaleY = 1 + Math.sin(Date.now() * 0.001 + index) * 0.1;
        mesh.scale.y = scaleY;
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [performance]);
  
  return (
    <div ref={mountRef} className={`w-full h-full min-h-[300px] ${className || ''}`} />
  );
};

export default TradingBotVisual;
