export function getTagColor(tagName: string) {
  // 预设的一套“阳光明媚”的色板 (Sunny Palette)
  // 包含：暖黄、活力橙、珊瑚粉、天蓝、草绿、紫罗兰
  const palette = [
    '#F59E0B', // Amber 500
    '#EA580C', // Orange 600
    '#F43F5E', // Rose 500
    '#8B5CF6', // Violet 500
    '#0EA5E9', // Sky 500
    '#10B981', // Emerald 500
    '#EC4899', // Pink 500
    '#F97316', // Orange 500
    '#6366F1', // Indigo 500
    '#84CC16', // Lime 500
  ];

  // 简单的哈希算法：根据标签名的每个字符计算一个数字
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 取绝对值并对色板长度取模，保证同一个标签永远得到同一个颜色
  const index = Math.abs(hash) % palette.length;

  return palette[index];
}

// 获取带透明度的背景色 (用于毛玻璃效果)
export function getTagStyles(tagName: string) {
  const color = getTagColor(tagName);
  return {
    color: color,
    backgroundColor: `${color}33`, // ~20% opacity
    borderColor: `${color}66`,     // ~40% opacity
  };
}
