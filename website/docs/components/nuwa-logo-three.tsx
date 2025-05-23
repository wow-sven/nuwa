"use client";
import { Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { OrbitControls, Text, Environment } from "@react-three/drei";

// 倾斜配置参数
const TILT_CONFIG = {
  // 倾斜强度（数值越大，倾斜角度越大）
  tiltStrength: {
    x: 0.15, // 垂直方向倾斜强度
    y: 0.1, // 水平方向倾斜强度
  },

  // 倾斜方向（1 = 鼠标移动方向相同，-1 = 相反方向）
  tiltDirection: {
    x: -1, // 1: 鼠标向上时向上倾斜，-1: 鼠标向上时向下倾斜
    y: 1, // 1: 鼠标向右时向右倾斜，-1: 鼠标向右时向左倾斜
  },

  // 动画平滑度（数值越大越灵敏，越小越平滑）
  dampingFactor: 8,

  // 初始旋转角度
  initialRotation: {
    x: -Math.PI / 11,
    y: -Math.PI / 9,
    z: 0,
  },
};

const Figure = ({ position }: { position: [number, number, number] }) => {
  const svgData = useLoader(SVGLoader, "/nuwa.svg");
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({
    x: TILT_CONFIG.initialRotation.x,
    y: TILT_CONFIG.initialRotation.y,
  });
  const isPageFocused = useRef(true);

  useEffect(() => {
    // 鼠标移动处理
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPageFocused.current) return;

      const canvas = document.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mousePos.current = { x, y };
    };

    // 页面焦点处理
    const handleFocus = () => {
      isPageFocused.current = true;
    };

    const handleBlur = () => {
      isPageFocused.current = false;
      // 重置鼠标位置，使物体回到原始位置
      mousePos.current = { x: 0, y: 0 };
    };

    // 鼠标离开画布时也重置位置
    const handleMouseLeave = () => {
      mousePos.current = { x: 0, y: 0 };
    };

    const canvas = document.querySelector("canvas");

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    canvas?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      canvas?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 平滑动画
  useFrame((state, delta) => {
    if (meshRef.current) {
      // 计算目标旋转角度
      targetRotation.current.x =
        TILT_CONFIG.initialRotation.x +
        mousePos.current.y *
          TILT_CONFIG.tiltStrength.x *
          TILT_CONFIG.tiltDirection.x;
      targetRotation.current.y =
        TILT_CONFIG.initialRotation.y +
        mousePos.current.x *
          TILT_CONFIG.tiltStrength.y *
          TILT_CONFIG.tiltDirection.y;

      // 使用阻尼实现平滑过渡
      meshRef.current.rotation.x +=
        (targetRotation.current.x - meshRef.current.rotation.x) *
        delta *
        TILT_CONFIG.dampingFactor;
      meshRef.current.rotation.y +=
        (targetRotation.current.y - meshRef.current.rotation.y) *
        delta *
        TILT_CONFIG.dampingFactor;
    }
  });

  const shapes = svgData.paths.flatMap((path) => path.toShapes(true));

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 10,
    bevelEnabled: true,
    bevelThickness: 0.9,
    bevelSize: 1,
    bevelSegments: 30,
    steps: 1,
  });
  geometry.center();

  return (
    <mesh
      geometry={geometry}
      scale={0.201}
      ref={meshRef}
      position={position}
      rotation={[
        TILT_CONFIG.initialRotation.x,
        TILT_CONFIG.initialRotation.y,
        TILT_CONFIG.initialRotation.z,
      ]}
    >
      <meshPhysicalMaterial
        attach="material"
        color="#FF15FB"
        metalness={1}
        roughness={0.29}
        clearcoat={1}
        clearcoatRoughness={0.1}
        reflectivity={1}
        transmission={0.5}
        thickness={0.08}
        ior={1.5}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
};

const Loading = () => {
  return <Text>Loading</Text>;
};

const Scene = () => (
  <>
    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
    <pointLight position={[-10, -10, 10]} intensity={0.5} />
    <Environment preset="sunset" />
    <Figure position={[0, 0, 0]} />
  </>
);

export default function NuwaLogoThree() {
  return (
    <Canvas
      style={{ width: 540, height: 540 }}
      camera={{ position: [0, 0, 20] }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={<Loading />}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
