import { motion } from 'framer-motion'

export default function Logo({ size = 32, className = '', animated = true }) {
  const px = size / 48 // scale factor

  // Skull pixel positions (x, y) on a 48x48 grid
  const skullPixels = [
    // Top row
    [16,10],[20,10],[24,10],[28,10],
    // Second row
    [12,14],[16,14],[20,14],[24,14],[28,14],[32,14],
    // Eyes row - skip eye holes
    [12,18],[16,18],[28,18],[32,18],
    // Mid face
    [12,22],[16,22],[20,22],[24,22],[28,22],[32,22],
    // Jaw
    [16,26],[22,26],[28,26],
  ]

  // Eye pixels that blink
  const leftEye = [[20,18],[20,22]]
  const rightEye = [[24,18],[24,22]]

  // Switch bar pixels
  const switchLeft = [[10,34],[14,34],[18,34]]
  const switchRight = [[26,34],[30,34],[34,34]]
  const switchToggle = [[22,34]]

  // Bottom dots
  const bottomDots = [[10,40],[34,40]]

  const pixelSize = 4 * px

  const renderPixel = (x, y, fill, delay = 0, key) => (
    <motion.rect
      key={key}
      x={x * px}
      y={y * px}
      width={pixelSize}
      height={pixelSize}
      fill={fill}
      initial={animated ? { opacity: 0, scale: 0 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={animated ? { delay, duration: 0.15, ease: 'easeOut' } : {}}
    />
  )

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Red background */}
      <rect width={size} height={size} fill="#FF2D20" />

      {/* Skull pixels - staggered appear */}
      {skullPixels.map(([x, y], i) => renderPixel(x, y, '#000', 0.03 * i, `s${i}`))}

      {/* Eyes - blink animation */}
      {leftEye.map(([x, y], i) => (
        <motion.rect
          key={`le${i}`}
          x={x * px}
          y={y * px}
          width={pixelSize}
          height={pixelSize}
          fill="#FF2D20"
          animate={animated ? { opacity: [1, 1, 0, 1, 1] } : {}}
          transition={animated ? { repeat: Infinity, duration: 3, times: [0, 0.45, 0.5, 0.55, 1] } : {}}
        />
      ))}
      {rightEye.map(([x, y], i) => (
        <motion.rect
          key={`re${i}`}
          x={x * px}
          y={y * px}
          width={pixelSize}
          height={pixelSize}
          fill="#FF2D20"
          animate={animated ? { opacity: [1, 1, 0, 1, 1] } : {}}
          transition={animated ? { repeat: Infinity, duration: 3, times: [0, 0.45, 0.5, 0.55, 1], delay: 0.05 } : {}}
        />
      ))}

      {/* Switch bar */}
      {switchLeft.map(([x, y], i) => renderPixel(x, y, '#000', 0.6 + i * 0.05, `sl${i}`))}
      {switchRight.map(([x, y], i) => renderPixel(x, y, '#000', 0.75 + i * 0.05, `sr${i}`))}

      {/* Switch toggle - slides back and forth */}
      {switchToggle.map(([x, y], i) => (
        <motion.rect
          key={`st${i}`}
          x={x * px}
          y={y * px}
          width={pixelSize}
          height={pixelSize}
          fill="#fff"
          animate={animated ? { x: [0, 4 * px, 0, -4 * px, 0] } : {}}
          transition={animated ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
        />
      ))}

      {/* Bottom corner dots - pulse */}
      {bottomDots.map(([x, y], i) => (
        <motion.rect
          key={`bd${i}`}
          x={x * px}
          y={y * px}
          width={pixelSize}
          height={pixelSize}
          fill="#000"
          animate={animated ? { opacity: [1, 0.3, 1] } : {}}
          transition={animated ? { repeat: Infinity, duration: 1.5, delay: i * 0.5 } : {}}
        />
      ))}
    </svg>
  )
}
