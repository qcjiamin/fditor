import { InteractiveFabricObject, TClassProperties, TPointerEvent, Transform } from 'fabric'

export const rotateIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHdpZHRoPSc1MicgaGVpZ2h0PSc1Micgdmlld0JveD0nMCAwIDUyIDUyJz4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9JzMzNicgeD0nMCcgeT0nMCcgd2lkdGg9JzUyJyBoZWlnaHQ9JzUyJyBmaWx0ZXJVbml0cz0ndXNlclNwYWNlT25Vc2UnPgogICAgICA8ZmVPZmZzZXQgaW5wdXQ9J1NvdXJjZUFscGhhJy8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzUnIHJlc3VsdD0nYmx1cicvPgogICAgICA8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PScwLjMzMycvPgogICAgICA8ZmVDb21wb3NpdGUgb3BlcmF0b3I9J2luJyBpbjI9J2JsdXInLz4KICAgICAgPGZlQ29tcG9zaXRlIGluPSdTb3VyY2VHcmFwaGljJy8+CiAgICA8L2ZpbHRlcj4KICAgIDxjbGlwUGF0aCBpZD0nY2xpcC1wYXRoJz4KICAgICAgPHJlY3QgaWQ9JzE5NTQnIGRhdGEtbmFtZT0nMTk1NCcgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgwLjMzKScgZmlsbD0nI2ZmZicgc3Ryb2tlPScjMWUxZTJlJyBzdHJva2Utd2lkdGg9JzEuNScvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+CiAgPGcgaWQ9J3JvdGF0ZScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTE3MyAtMzIpJz4KICAgIDxnIHRyYW5zZm9ybT0nbWF0cml4KDEsIDAsIDAsIDEsIDE3MywgMzIpJyBmaWx0ZXI9J3VybCgjMzM2KSc+CiAgICAgIDxjaXJjbGUgaWQ9JzMzNi0yJyBkYXRhLW5hbWU9JzMzNicgY3g9JzExJyBjeT0nMTEnIHI9JzExJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgxNSAxNSknIGZpbGw9JyNmZmYnLz4KICAgIDwvZz4KICAgIDxnIGlkPSc4MjAnIGRhdGEtbmFtZT0nODIwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgxODguNjcgNDgpJyBjbGlwLXBhdGg9J3VybCgjY2xpcC1wYXRoKSc+CiAgICAgIDxwYXRoIGlkPScxNzg4ODgnIGRhdGEtbmFtZT0nMTc4ODg4JyBkPSdNNC4wNywyLjVhNCw0LDAsMCwxLDQuNzYxLjY3NWwuMDExLjAxMUwxMC4yNCw0LjVIOC41YS41LjUsMCwwLDAsMCwxaDNBLjUuNSwwLDAsMCwxMiw1VjJhLjUuNSwwLDAsMC0xLDBWMy44NDJMOS41MzMsMi40NjJhNSw1LDAsMSwwLDEuMTgzLDUuMi41LjUsMCwxLDAtLjk0Mi0uMzM0QTQsNCwwLDEsMSw0LjA3LDIuNScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoNC4zMjggMy45OTkpJyBmaWxsPScjMWUxZjIyJyBzdHJva2U9JyMxZTFmMjInIHN0cm9rZS13aWR0aD0nMC41JyBmaWxsLXJ1bGU9J2V2ZW5vZGQnLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg=='
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
    sizeX: 24,
    sizeY: 24
  },
  ml: {
    visible: true,
    x: -0.5,
    y: 0,
    sizeX: 12,
    sizeY: 12
  },
  mr: {
    visible: true,
    x: 0.5,
    y: 0,
    sizeX: 12,
    sizeY: 12
  },
  mt: {
    visible: true,
    x: 0,
    y: -0.5,
    sizeX: 12,
    sizeY: 12
  },
  mb: {
    visible: true,
    x: 0,
    y: 0.5,
    sizeX: 12,
    sizeY: 12
  },
  tl: {
    visible: true,
    x: -0.5,
    y: -0.5,
    sizeX: 12,
    sizeY: 12
  },
  tr: {
    visible: true,
    x: 0.5,
    y: -0.5,
    sizeX: 12,
    sizeY: 12
  },
  bl: {
    visible: true,
    x: -0.5,
    y: 0.5,
    sizeX: 12,
    sizeY: 12
  },
  br: {
    visible: true,
    x: 0.5,
    y: 0.5,
    sizeX: 12,
    sizeY: 12
  }
}
export const predefineControlStyle: Partial<TClassProperties<InteractiveFabricObject>> = {
  cornerStyle: 'rect',
  transparentCorners: false,
  cornerColor: 'rgb(255,255,255)',
  cornerStrokeColor: 'rgb(117, 89, 255)',
  borderColor: 'rgb(117, 89, 255)'
  // borderScaleFactor: 2.5
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
