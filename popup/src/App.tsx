import { useEffect, useMemo, useState } from "react"
import "./App.css"
import Toc from "./Toc"

function App() {
  const [outline, setOutline] = useState<Outline>()
  const [activeId, setActiveId] = useState("")
  const [lastReadId, setLastReadId] = useState("")

  useEffect(() => {
    const query = () => {
      chrome.tabs.query({ currentWindow: true, active: true }).then((res) => {
        if (!res[0]?.id) return
        Promise.all([
          chrome.tabs.sendMessage(res[0].id, {
            type: "RLR_GET_OUTLINE",
          }),
          chrome.tabs.sendMessage(res[0].id, {
            type: "RLR_GET_ACTIVE_ID",
          }),
          chrome.tabs.sendMessage(res[0].id, {
            type: "RLR_GET_LAST_READ_ID",
          }),
        ]).then(([outline, activeId, lastReadId]) => {
          setOutline(outline)
          setActiveId(activeId)
          setLastReadId(lastReadId)
        })
      })
    }
    query()
    chrome.tabs.onActivated.addListener(query)
    chrome.runtime.onMessage.addListener((message) => {
      switch (message.type) {
        case "RLR_SET_OUTLINE": {
          setOutline(message.payload)
        }
        case "RLR_SET_ACTIVE_ID": {
          setActiveId(message.payload)
          break
        }
        case "RLR_SET_LAST_READ_ID": {
          setLastReadId(message.payload)
          break
        }
      }
    })
  }, [])

  if (!outline) return null

  return <Toc data={outline} activeId={activeId} lastReadId={lastReadId} />
}

export default App
