import { useMemo } from "react"

function TocSection({
  data,
  activeId,
  lastReadId,
}: {
  data: Section
  activeId: string
  lastReadId: string
}) {
  const active = useMemo(() => data.id === activeId, [data, activeId])
  const lastRead = useMemo(() => data.id === lastReadId, [data, lastReadId])
  return (
    <li>
      <span
        //   href={`#${data.id}`}
        style={{
          color: active ? "green" : "red",
          background: lastRead ? "rgba(0, 0, 0, 0.5)" : "transparent",
        }}
        onClick={() => {
          // send message to jump
          chrome.tabs.query({ currentWindow: true, active: true }).then((res) => {
            if (!res[0]?.id) return
            chrome.tabs.sendMessage(res[0].id, {
              type: "RLR_JUMP",
              payload: data.id,
            })
          })
        }}
      >
        {data.title}
      </span>
      {data.sections.length > 0 && (
        <ol>
          {data.sections.map((item) => (
            <TocSection data={item} activeId={activeId} lastReadId={lastReadId} />
          ))}
        </ol>
      )}
    </li>
  )
}

function Toc({
  data,
  activeId,
  lastReadId,
}: {
  data: Outline
  activeId: string
  lastReadId: string
}) {
  return (
    <div>
      {data.sections.length > 0 && (
        <ol>
          {data.sections.map((item) => (
            <TocSection data={item} activeId={activeId} lastReadId={lastReadId} />
          ))}
        </ol>
      )}
    </div>
  )
}

export default Toc
