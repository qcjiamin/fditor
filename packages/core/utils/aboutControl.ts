import type { InteractiveFabricObject, TClassProperties, TPointerEvent, Transform } from 'fabric'

export const rotateIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4NCiAgPGRlZnM+DQogICAgPGZpbHRlciBpZD0ic2hhZG93LTEuNXB4IiB4PSItNTAlIiB5PSItNTAlIiB3aWR0aD0iMjAwJSIgaGVpZ2h0PSIyMDAlIj4NCiAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlQWxwaGEiIHN0ZERldmlhdGlvbj0iMS41IiByZXN1bHQ9ImJsdXIiLz4NCg0KICAgICAgPGZlT2Zmc2V0IGluPSJibHVyIiBkeD0iMC41IiBkeT0iMC41IiByZXN1bHQ9Im9mZnNldEJsdXIiLz4NCg0KICAgICAgPGZlTWVyZ2U+DQogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0ib2Zmc2V0Qmx1ciIvPg0KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4NCiAgICAgIDwvZmVNZXJnZT4NCiAgICA8L2ZpbHRlcj4NCiAgPC9kZWZzPg0KDQogIDxnIGZpbHRlcj0idXJsKCNzaGFkb3ctMS41cHgpIj4NCiAgICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMSIgZmlsbD0iI2ZmZiIvPg0KDQogICAgPHBhdGggZD0iTTQuMDcsMi41YTQsNCwwLDAsMSw0Ljc2MS42NzVsLjAxMS4wMTFMMTAuMjQsNC41SDguNWEuNS41LDAsMCwwLDAsMWgzQS41LjUsMCwwLDAsMTIsNVYyYS41LjUsMCwwLDAtMSwwVjMuODQyTDkuNTMzLDIuNDYyYTUsNSwwLDEsMCwxLjE4Myw1LjIuNS41LDAsMSwwLS45NDItLjMzNEE0LDQsMCwxLDEsNC4wNywyLjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwIDEwKSIgZmlsbD0iIzFlMWYyMiIgc3Ryb2tlPSIjMWUxZjIyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbC1ydWxlPSJldmVub2RkIiAvPg0KICA8L2c+DQo8L3N2Zz4='
export const lockIcon =
  'data:image/svg+xml;base64,PHN2ZyB0PSIxNzUwMjI5MjgyNjYyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIgogIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcC1pZD0iMTI1MTIiIGRhdGEtc3BtLWFuY2hvci1pZD0iYTMxM3guc2VhcmNoX2luZGV4LjAuaTIuNWE5MDNhODF4OUdSdFIiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj4KICA8cGF0aCBkPSJNNjIwLjggMzQ3LjczMzMzM2MwLTYuNCAwLTE0LjkzMzMzMy0yLjEzMzMzMy0yMS4zMzMzMzMtMTAuNjY2NjY3LTQ2LjkzMzMzMy01MS4yLTgxLjA2NjY2Ny0xMDAuMjY2NjY3LTgxLjA2NjY2Ny0yMS4zMzMzMzMgMC00MC41MzMzMzMgNi40LTU3LjYgMTcuMDY2NjY3LTIzLjQ2NjY2NyAxNC45MzMzMzMtMzguNCA0MC41MzMzMzMtNDIuNjY2NjY3IDY4LjI2NjY2NyAwIDYuNC0yLjEzMzMzMyAxMC42NjY2NjctMi4xMzMzMzMgMTcuMDY2NjY2djQyLjY2NjY2N2gyMDQuOHYtNDIuNjY2NjY3ek02NzIgNDM1LjJIMzYyLjY2NjY2N2MtMjMuNDY2NjY3IDAtNDIuNjY2NjY3IDE5LjItNDIuNjY2NjY3IDQyLjY2NjY2N3YyMDkuMDY2NjY2YzAgMjMuNDY2NjY3IDE5LjIgNDIuNjY2NjY3IDQyLjY2NjY2NyA0Mi42NjY2NjdoMzA5LjMzMzMzM2MyMy40NjY2NjcgMCA0Mi42NjY2NjctMTkuMiA0Mi42NjY2NjctNDIuNjY2NjY3di0yMDkuMDY2NjY2YzAtMjMuNDY2NjY3LTE3LjA2NjY2Ny00Mi42NjY2NjctNDIuNjY2NjY3LTQyLjY2NjY2N3ogbS0xMzIuMjY2NjY3IDE0OS4zMzMzMzN2NTkuNzMzMzM0YzAgMTAuNjY2NjY3LTguNTMzMzMzIDIxLjMzMzMzMy0yMS4zMzMzMzMgMjEuMzMzMzMzcy0yMS4zMzMzMzMtOC41MzMzMzMtMjEuMzMzMzMzLTIxLjMzMzMzM3YtNTkuNzMzMzM0Yy0xNC45MzMzMzMtOC41MzMzMzMtMjcuNzMzMzMzLTIzLjQ2NjY2Ny0yNy43MzMzMzQtNDIuNjY2NjY2IDAtMjUuNiAyMS4zMzMzMzMtNDkuMDY2NjY3IDQ5LjA2NjY2Ny00OS4wNjY2NjdzNDkuMDY2NjY3IDIxLjMzMzMzMyA0OS4wNjY2NjcgNDkuMDY2NjY3Yy0yLjEzMzMzMyAxOS4yLTEyLjggMzQuMTMzMzMzLTI3LjczMzMzNCA0Mi42NjY2NjZ6IiBmaWxsPSIjNzA3MDcwIiBwLWlkPSIxMjUxMyIgZGF0YS1zcG0tYW5jaG9yLWlkPSJhMzEzeC5zZWFyY2hfaW5kZXguMC5pMy41YTkwM2E4MXg5R1J0UiIgY2xhc3M9InNlbGVjdGVkIj48L3BhdGg+CiAgPHBhdGggZD0iTTUxMiA1OS43MzMzMzNjLTI0Ny40NjY2NjcgMC00NDggMjAwLjUzMzMzMy00NDggNDQ4czIwMC41MzMzMzMgNDQ4IDQ0OCA0NDggNDQ4LTIwMC41MzMzMzMgNDQ4LTQ0OC0yMDAuNTMzMzMzLTQ0OC00NDgtNDQ4eiBtMjQ1LjMzMzMzMyA2MjUuMDY2NjY3YzAgNDYuOTMzMzMzLTM4LjQgODUuMzMzMzMzLTg1LjMzMzMzMyA4NS4zMzMzMzNIMzYyLjY2NjY2N2MtNDYuOTMzMzMzIDAtODUuMzMzMzMzLTM4LjQtODUuMzMzMzM0LTg1LjMzMzMzM3YtMjA5LjA2NjY2N2MwLTQ2LjkzMzMzMyAzOC40LTg1LjMzMzMzMyA4NS4zMzMzMzQtODUuMzMzMzMzaDEwLjY2NjY2NnYtNDIuNjY2NjY3YzAtOC41MzMzMzMgMC0xNy4wNjY2NjcgMi4xMzMzMzQtMjUuNiA2LjQtMzguNCAyOS44NjY2NjctNzIuNTMzMzMzIDYxLjg2NjY2Ni05NiAyMy40NjY2NjctMTcuMDY2NjY3IDUxLjItMjUuNiA4MS4wNjY2NjctMjUuNiA2OC4yNjY2NjcgMCAxMjggNDkuMDY2NjY3IDE0Mi45MzMzMzMgMTE1LjIgMi4xMzMzMzMgOC41MzMzMzMgMi4xMzMzMzMgMTkuMiAyLjEzMzMzNCAyOS44NjY2Njd2NDIuNjY2NjY3aDEwLjY2NjY2NmM0Ni45MzMzMzMgMCA4NS4zMzMzMzMgMzguNCA4NS4zMzMzMzQgODUuMzMzMzMzdjIxMS4yeiIgZmlsbD0iIzcwNzA3MCIgcC1pZD0iMTI1MTQiIGRhdGEtc3BtLWFuY2hvci1pZD0iYTMxM3guc2VhcmNoX2luZGV4LjAuaTQuNWE5MDNhODF4OUdSdFIiIGNsYXNzPSJzZWxlY3RlZCI+PC9wYXRoPgo8L3N2Zz4='
export const predefineOptions = {
  mtr: {
    visible: true,
    x: 0,
    y: -0.5,
    offsetX: 0,
    offsetY: 0,
    imgurl: rotateIcon,
    sizeX: 15,
    sizeY: 15
  },
  ml: {
    visible: true,
    x: -0.5,
    y: 0
    // 控制点宽高，如果没有，则为对象的 cornerSize 属性值
    // sizeX: 8,
    // sizeY: 8
  },
  mr: {
    visible: true,
    x: 0.5,
    y: 0
  },
  mt: {
    visible: true,
    x: 0,
    y: -0.5
  },
  mb: {
    visible: true,
    x: 0,
    y: 0.5
  },
  tl: {
    visible: true,
    x: -0.5,
    y: -0.5
  },
  tr: {
    visible: true,
    x: 0.5,
    y: -0.5
  },
  bl: {
    visible: true,
    x: -0.5,
    y: 0.5
  },
  br: {
    visible: true,
    x: 0.5,
    y: 0.5
  }
}
export const predefineControlStyle: Partial<TClassProperties<InteractiveFabricObject>> = {
  cornerStyle: 'circle',
  transparentCorners: false,
  cornerColor: 'rgb(255,255,255)',
  cornerStrokeColor: '#53ede8',
  borderColor: '#53ede8',
  cornerSize: 8,
  // touchCornerSize: 24,
  borderScaleFactor: 1.5
}

export const predefineLock = {
  visible: false,
  x: 0.5,
  y: 0.5,
  sizeX: 15,
  sizeY: 15,
  imgurl: lockIcon,
  cursorStyle: 'pointer',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseUpHandler: (_eventData: TPointerEvent, transform: Transform, _x: number, _y: number) => {
    const target = transform.target
    target.unlock()
  }
}
