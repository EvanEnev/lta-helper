'use client'

import {io, Socket} from 'socket.io-client'

let socket: Socket | null = null

export default function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:4000', {
      autoConnect: false,
      withCredentials: true,
    })
  }

  return socket
}
