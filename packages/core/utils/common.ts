/** 
 获取工作区按照容器宽高缩放度
 @param destination 工作区比例
 @param source 容器当前宽高
 */
export function findScaleToFit(
  source: { width: number; height: number },
  destination: { width: number; height: number }
) {
  return Math.min(destination.width / source.width, destination.height / source.height)
}
