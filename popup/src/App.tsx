import { useEffect, useMemo, useState } from "react"
import createOutline from "h5o"
import "./App.css"

const getPreviousEl = (el: HTMLElement): HTMLElement | null => {
  if (el.previousElementSibling) {
    if (el.previousElementSibling instanceof HTMLElement) {
      return el.previousElementSibling
    } else {
      return null
    }
  } else if (el.parentElement) {
    return getPreviousEl(el.parentElement)
  } else {
    return null
  }
}

type Itersections = { [x in string]: [boolean, boolean] }

function TocSection({
  data,
  activeId,
}: {
  data: ReturnType<typeof createOutline>["sections"][number]
  activeId: string
}) {
  const active = useMemo(() => data.heading.dataset.rlrStart === activeId, [data, activeId])
  return (
    <li>
      <a href={`#${data.heading.id}`} style={{ color: active ? "green" : "red" }}>
        {data.heading.textContent}
      </a>
      {data.sections.length > 0 && (
        <ol>
          {data.sections.map((item) => (
            <TocSection data={item} activeId={activeId} />
          ))}
        </ol>
      )}
    </li>
  )
}

function App() {
  const [outline, setOutline] = useState<ReturnType<typeof createOutline> | null>(null)
  const [headings, setHeadings] = useState<HTMLHeadingElement[]>()
  const [intersections, setIntersections] = useState<Itersections>()

  useEffect(() => {
    const outline = createOutline(document.body)

    const ob = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement)) break

        const start = entry.target.dataset.rlrStart
        const end = entry.target.dataset.rlrEnd

        if (entry.intersectionRatio <= 0) {
          setIntersections((v) => {
            const newValue = { ...v }
            if (start) {
              const old = newValue[start]
              if (old) {
                newValue[start][0] = false
              } else {
                newValue[start] = [false, false]
              }
            }
            if (end) {
              const old = newValue[end]
              if (old) {
                newValue[end][1] = false
              } else {
                newValue[end] = [false, false]
              }
            }
            return newValue
          })
        } else {
          setIntersections((v) => {
            const newValue = { ...v }
            if (start) {
              const old = newValue[start]
              if (old) {
                newValue[start][0] = true
              } else {
                newValue[start] = [true, false]
              }
            }
            if (end) {
              const old = newValue[end]
              if (old) {
                newValue[end][1] = true
              } else {
                newValue[end] = [false, true]
              }
            }
            return newValue
          })
        }
      }
    })

    const headings: HTMLHeadingElement[] = []
    const walk = (sections: typeof outline["sections"]) => {
      for (const section of sections) {
        headings.push(section.heading)
        if (section.sections && section.sections.length > 0) {
          walk(section.sections)
        }
      }
    }
    walk(outline.sections)
    setHeadings(headings)

    for (let i = 0; i < headings.length; i++) {
      const currentHeading = headings[i]
      const id = `_rlr_${i}`
      if (!currentHeading.id) {
        currentHeading.id = `_rlr_${i}`
        currentHeading.dataset.rlrStart = id
        ob.observe(currentHeading)
      }
      const mybeEndEl = headings[i + 1]
      if (mybeEndEl) {
        const endEl = getPreviousEl(mybeEndEl)
        if (endEl) {
          endEl.dataset.rlrEnd = id
          ob.observe(endEl)
        }
      }
    }

    setOutline(outline)
  }, [])

  const activeId = useMemo(() => {
    for (const id in intersections) {
      if (intersections[id].some(Boolean)) {
        return id
      }
    }
    return ""
  }, [headings, intersections])

  return (
    <div>
      <div style={{ position: "fixed", right: 16, top: 16 }}>
        {outline ? (
          <ol>
            {outline.sections.map((item) => (
              <TocSection data={item} activeId={activeId} />
            ))}
          </ol>
        ) : null}
      </div>
      <h1>t1</h1>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h2>t11</h2>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h2>t12</h2>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h2>t13</h2>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h1>t2</h1>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h2>t21</h2>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h1>t3</h1>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
      <h3>t311</h3>
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>{" "}
      <p>asd asdasda 123 cddasdas</p> <p>asd asdasda 123 cddasdas</p>
    </div>
  )
}

export default App
