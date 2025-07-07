import {
  BasicTransformEvent,
  ObjectModificationEvents,
  Point,
  TModificationEvents,
  Transform,
  TransformAction,
  TransformActionHandler
} from 'fabric'

//! 包装方法 wrapWithFixedAnchor： 重新定位； wrapWithFireEvent：触发事件；都来自fabric controls

/**
 * Wrap an action handler with saving/restoring object position on the transform.
 * this is the code that permits to objects to keep their position while transforming.
 * @param {Function} actionHandler the function to wrap
 * @return {Function} a function with an action handler signature
 */
export function wrapWithFixedAnchor<T extends Transform>(actionHandler: TransformActionHandler<T>) {
  return ((eventData, transform, x, y) => {
    const { target, originX, originY } = transform
    const centerPoint = target.getRelativeCenterPoint()
    const constraint = target.translateToOriginPoint(centerPoint, originX, originY)
    const actionPerformed = actionHandler(eventData, transform, x, y)
    // flipping requires to change the transform origin, so we read from the mutated transform
    // instead of leveraging the one destructured before
    target.setPositionByOrigin(constraint, transform.originX, transform.originY)

    return actionPerformed
  }) as TransformActionHandler<T>
}

export const fireEvent = (eventName: TModificationEvents, options: ObjectModificationEvents[typeof eventName]) => {
  const {
    transform: { target }
  } = options
  target.canvas?.fire(`object:${eventName}`, {
    ...options,
    target
  })
  target.fire(eventName, options)
}

export const commonEventInfo: TransformAction<Transform, BasicTransformEvent> = (eventData, transform, x, y) => {
  return {
    e: eventData,
    transform,
    pointer: new Point(x, y)
  }
}

/**
 * Wrap an action handler with firing an event if the action is performed
 * @param {TModificationEvents} eventName the event we want to fire
 * @param {TransformActionHandler<T>} actionHandler the function to wrap
 * @param {object} extraEventInfo extra information to pas to the event handler
 * @return {TransformActionHandler<T>} a function with an action handler signature
 */
export const wrapWithFireEvent = <T extends Transform, P extends object = Record<string, never>>(
  eventName: TModificationEvents,
  actionHandler: TransformActionHandler<T>,
  extraEventInfo?: P
) => {
  return ((eventData, transform, x, y) => {
    const actionPerformed = actionHandler(eventData, transform, x, y)
    if (actionPerformed) {
      fireEvent(eventName, {
        ...commonEventInfo(eventData, transform, x, y),
        ...extraEventInfo
      })
    }
    return actionPerformed
  }) as TransformActionHandler<T>
}

export * from './gradient'
