import { useEffect, useMemo, useRef } from "react"

function isInView(el: HTMLElement) {
  const bounding = el.getBoundingClientRect()
  return (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    bounding.right <= window.innerWidth &&
    bounding.bottom <= window.innerHeight
  )
}

function TocSection({
  data,
  activeId,
  lastReadId,
}: {
  data: Section
  activeId: string
  lastReadId: string
}) {
  const nodeRef = useRef<HTMLLIElement>(null)

  const active = useMemo(() => data.id === activeId, [data, activeId])
  const lastRead = useMemo(() => data.id === lastReadId, [data, lastReadId])

  useEffect(() => {
    if (!nodeRef.current) return
    if (active && !isInView(nodeRef.current)) {
      nodeRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [active])

  return (
    <li
      ref={nodeRef}
      className={`${
        active ? "text-base-content" : "text-base-content/70 marker:opacity-80 marker:text-xs"
      }`}
    >
      <span
        className={`cursor-pointer px-1 py-0.5 rounded ${
          active ? "text-base-content bg-base-200 font-medium" : "text-base-content/70"
        }`}
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
        {data.title || "Untitled"}
      </span>
      {lastRead ? (
        <span className="ml-2 badge badge-primary badge-xs rounded py-0.5 h-4 scale-75 origin-left">
          Last Read
        </span>
      ) : null}
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
    <div className="bg-base-100 text-base-content">
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
