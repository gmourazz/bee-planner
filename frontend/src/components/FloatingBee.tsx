export function FloatingBee({ size = "80px" }: { size?: string }) {
  return (
    <div className="bee-mascot inline-block" style={{ fontSize: size }}>
      🐝
    </div>
  );
}
