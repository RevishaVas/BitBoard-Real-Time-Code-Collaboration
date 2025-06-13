import { atom } from "recoil"

export const userAtom = atom({
  key: "userAtom",
  default: { id: "", name: "", roomId: "", roomName: "", websocketToken: "" }
})
