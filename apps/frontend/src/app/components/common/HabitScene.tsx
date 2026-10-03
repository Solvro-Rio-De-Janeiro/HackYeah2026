import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function SparseConstellation({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  const count = isMobile ? 20 : 38;
  const maxDistance = isMobile ? 1.1 : 1.2;

  const { nodes } = useMemo(() => {
    const nodeList: {
      basePos: THREE.Vector3;
      currentPos: THREE.Vector3;
      speed: number;
      offset: number;
      size: number;
      color: string;
    }[] = [];

    const palette = ["#f97316", "#a855f7", "#c084fc", "#e9d5ff", "#fb923c"];

    for (let i = 0; i < count; i++) {
      const radius =
        (isMobile ? 1.2 : 1.8) + Math.random() * (isMobile ? 2.0 : 3.2);
      const angle = (i / count) * Math.PI * 2 + Math.random() * 1.5;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * (isMobile ? 3.2 : 4.5);
      const z = (Math.random() - 0.5) * 2.5;

      const basePos = new THREE.Vector3(x, y, z);
      const isOrange = Math.random() > 0.6;

      nodeList.push({
        basePos,
        currentPos: basePos.clone(),
        speed: 0.5 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
        size: isOrange ? 0.025 : 0.018 + Math.random() * 0.008,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    return { nodes: nodeList };
  }, [count, isMobile]);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const linePositions = useMemo(
    () => new Float32Array(count * count * 6),
    [count],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    nodes.forEach((node) => {
      node.currentPos.x =
        node.basePos.x + Math.sin(t * node.speed * 0.3 + node.offset) * 0.15;
      node.currentPos.y =
        node.basePos.y + Math.cos(t * node.speed * 0.4 + node.offset) * 0.15;
      node.currentPos.z =
        node.basePos.z + Math.sin(t * node.speed * 0.2 + node.offset) * 0.1;
    });

    let vertexIdx = 0;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = nodes[i].currentPos.distanceTo(nodes[j].currentPos);

        if (dist < maxDistance) {
          linePositions[vertexIdx++] = nodes[i].currentPos.x;
          linePositions[vertexIdx++] = nodes[i].currentPos.y;
          linePositions[vertexIdx++] = nodes[i].currentPos.z;

          linePositions[vertexIdx++] = nodes[j].currentPos.x;
          linePositions[vertexIdx++] = nodes[j].currentPos.y;
          linePositions[vertexIdx++] = nodes[j].currentPos.z;
        }
      }
    }

    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions.subarray(0, vertexIdx), 3),
    );
    lineGeometry.computeBoundingSphere();

    groupRef.current.rotation.y = t * 0.025;
    groupRef.current.rotation.x = Math.sin(t * 0.015) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.18}
          linewidth={1}
        />
      </lineSegments>

      {nodes.map((node, idx) => (
        <mesh key={idx} position={node.currentPos}>
          <sphereGeometry args={[node.size, 12, 12]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function HabitScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 5.5 : 4.5], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.2} />

      <SparseConstellation isMobile={isMobile} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}

export default HabitScene;
