import { StaticCanvas, Canvas, Point, classRegistry } from 'fabric'
import { Group, LayoutStrategy, LayoutManager } from 'fabric'
import { util } from 'fabric'
StaticCanvas.prototype._renderBackgroundOrOverlay = function (ctx, property) {
  const fill = this[property + 'Color'],
    object = this[property + 'Image'],
    v = this.viewportTransform,
    needsVpt = this[property + 'Vpt']
  if (!fill && !object) {
    return
  }
  //! polifill: 在背景色下面，先绘制一层垫片颜色,理论上应该只支持纯色黑OR白
  if (property === 'background') {
    const podFill = this.padColor ?? 'rgba(0,0,0,1)'
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.width, 0)
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(0, this.height)
    ctx.closePath()
    ctx.fillStyle = podFill
    ctx.fill()
    ctx.restore()
  }

  if (fill) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.width, 0)
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(0, this.height)
    ctx.closePath()
    ctx.fillStyle = fill.toLive ? fill.toLive(ctx, this) : fill
    if (needsVpt) {
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    }
    ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0)
    const m = fill.gradientTransform || fill.patternTransform
    m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
    ctx.fill()
    ctx.restore()
  }
  if (object) {
    ctx.save()
    if (needsVpt) {
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    }
    object.render(ctx)
    ctx.restore()
  }
}

export function insertLockRule() {
  // 框选不能选择锁定的元素
  Canvas.prototype.handleSelection = function (e) {
    if (!this.selection || !this._groupSelector) {
      return false
    }
    const { x, y, deltaX, deltaY } = this._groupSelector,
      point1 = new Point(x, y),
      point2 = point1.add(new Point(deltaX, deltaY)),
      tl = point1.min(point2),
      br = point1.max(point2),
      size = br.subtract(tl)
    const collectedObjects = this.collectObjects(
      {
        left: tl.x,
        top: tl.y,
        width: size.x,
        height: size.y
      },
      {
        includeIntersecting: !this.selectionFullyContained
      }
    )
    let objects =
      // though this method runs only after mouse move the pointer could do a mouse up on the same position as mouse down
      // should it be handled as is?
      point1.eq(point2)
        ? collectedObjects[0]
          ? [collectedObjects[0]]
          : []
        : collectedObjects.length > 1
          ? collectedObjects
              .filter(
                (object) =>
                  !object.onSelect({
                    e
                  })
              )
              .reverse()
          : // `setActiveObject` will call `onSelect(collectedObjects[0])` in this case
            collectedObjects
    objects = objects.filter((object) => !object.isLock())
    console.log(objects)
    // set active object
    if (objects.length === 1) {
      // set as active object
      this.setActiveObject(objects[0], e)
    } else if (objects.length > 1) {
      // add to active selection and make it the active object
      const klass = classRegistry.getClass('ActiveSelection')
      this.setActiveObject(
        new klass(objects, {
          canvas: this
        }),
        e
      )
    }

    // cleanup
    this._groupSelector = null
    return true
  }

  const isActiveSelection = (fabricObject) => !!fabricObject && 'multiSelectionStacking' in fabricObject
  // shift+click 多选时,禁止选中锁定对象;active为锁定对象时，禁止多选其他对象
  Canvas.prototype.handleMultiSelection = function (e, target) {
    const activeObject = this._activeObject
    const originLock = activeObject && activeObject.isLock && activeObject.isLock()
    const isAS = isActiveSelection(activeObject)
    const hasIsLock = target && target.isLock
    const targetLock = target && target.isLock && target.isLock()
    if (
      !originLock &&
      !targetLock &&
      // check if an active object exists on canvas and if the user is pressing the `selectionKey` while canvas supports multi selection.
      !!activeObject &&
      this._isSelectionKeyPressed(e) &&
      this.selection &&
      // on top of that the user also has to hit a target that is selectable.
      !!target &&
      target.selectable &&
      // group target and active object only if they are different objects
      // else we try to find a subtarget of `ActiveSelection`
      (activeObject !== target || isAS) &&
      //  make sure `activeObject` and `target` aren't ancestors of each other in case `activeObject` is not `ActiveSelection`
      // if it is then we want to remove `target` from it
      (isAS || (!target.isDescendantOf(activeObject) && !activeObject.isDescendantOf(target))) &&
      //  target accepts selection
      !target.onSelect({
        e
      }) &&
      // make sure we are not on top of a control
      !activeObject.getActiveControl()
    ) {
      if (isAS) {
        const prevActiveObjects = activeObject.getObjects()
        if (target === activeObject) {
          const pointer = this.getViewportPoint(e)
          target =
            // first search active objects for a target to remove
            this.searchPossibleTargets(prevActiveObjects, pointer) ||
            //  if not found, search under active selection for a target to add
            // `prevActiveObjects` will be searched but we already know they will not be found
            this.searchPossibleTargets(this._objects, pointer)
          // if nothing is found bail out
          if (!target || !target.selectable) {
            return false
          }
        }
        if (target.group === activeObject) {
          // `target` is part of active selection => remove it
          activeObject.remove(target)
          this._hoveredTarget = target
          this._hoveredTargets = [...this.targets]
          // if after removing an object we are left with one only...
          if (activeObject.size() === 1) {
            // activate last remaining object
            // deselecting the active selection will remove the remaining object from it
            this._setActiveObject(activeObject.item(0), e)
          }
        } else {
          // `target` isn't part of active selection => add it
          activeObject.multiSelectAdd(target)
          this._hoveredTarget = activeObject
          this._hoveredTargets = [...this.targets]
        }
        this._fireSelectionEvents(prevActiveObjects, e)
      } else {
        activeObject.isEditing && activeObject.exitEditing()
        // add the active object and the target to the active selection and set it as the active object
        const klass = classRegistry.getClass('ActiveSelection')
        const newActiveSelection = new klass([], {
          /**
           * it is crucial to pass the canvas ref before calling {@link ActiveSelection#multiSelectAdd}
           * since it uses {@link FabricObject#isInFrontOf} which relies on the canvas ref
           */
          canvas: this
        })
        console.log(target)
        newActiveSelection.multiSelectAdd(activeObject, target)
        this._hoveredTarget = newActiveSelection
        // ISSUE 4115: should we consider subTargets here?
        // this._hoveredTargets = [];
        // this._hoveredTargets = this.targets.concat();
        this._setActiveObject(newActiveSelection, e)
        this._fireSelectionEvents([activeObject], e)
      }
      return true
    }
    return false
  }
}
