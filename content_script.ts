import createOutline from "h5o"

const LOCAL_KEY = "_rlr_"
const PREFIX_ID = "_rlr_"
const DATASET_START = "rlrStart"
const DATASET_END = "rlrEnd"
const DATASET_START_ATTR = "data-rlr-start"

const getHeadingId = (index: number) => PREFIX_ID + index
const getCacheId = () => location.host + location.pathname

async function getCache() {
  try {
    const res = await chrome.storage.local.get([LOCAL_KEY])
    return res[LOCAL_KEY] || {}
  } catch (err) {
    return {}
  }
}

async function setCache(id: ReturnType<typeof getHeadingId>) {
  const cache = await getCache()
  cache[getCacheId()] = id
  try {
    await chrome.storage.local.set({ [LOCAL_KEY]: cache })
  } catch (err) {
    chrome.storage.local.clear()
  }
}

function getPreviousEl(el: HTMLElement): HTMLElement | null {
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

// [startPositionInsideView, endPositionInsideView]
type Intersections = { [x in string]: [boolean, boolean] }

const _store: {
  outline: Outline | null
  intersections: Intersections
  headings: HTMLHeadingElement[]
} = {
  outline: { sections: [] },
  intersections: {},
  headings: [],
}

let lastReadId: string

async function initLastRead() {
  const cache = await getCache()
  lastReadId = cache[getCacheId()]

  chrome.runtime
    .sendMessage({
      type: "RLR_SET_LAST_READ_ID",
      payload: lastReadId,
    })
    .catch((err) => {
      //
    })
}

initLastRead()

function getActiveId(intersections: Intersections) {
  // ✨
  for (const id in intersections) {
    if (intersections[id].some(Boolean)) {
      return id
    }
  }
  return ""
}

let prevActiveId: string

const store = new Proxy(_store, {
  get(target, prop) {
    if (prop === "activeId") {
      return getActiveId(target.intersections)
    }
    return Reflect.get(target, prop)
  },
  set(target, prop, value) {
    if (prop === "intersections") {
      const activeId = getActiveId(value)
      if (activeId && activeId !== prevActiveId) {
        prevActiveId = activeId
        setCache(activeId)
        chrome.runtime
          .sendMessage({
            type: "RLR_SET_ACTIVE_ID",
            payload: activeId,
          })
          .catch((err) => {
            //
          })
      }
    }
    Reflect.set(target, prop, value)
    return true
  },
})

function init() {
  const outline = createOutline(document.body)

  const ob = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!(entry.target instanceof HTMLElement)) break

      const start = entry.target.dataset[DATASET_START]
      const end = entry.target.dataset[DATASET_END]

      if (entry.intersectionRatio <= 0) {
        store.intersections = (() => {
          const newValue = { ...store.intersections }
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
        })()
      } else {
        store.intersections = (() => {
          const newValue = { ...store.intersections }
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
        })()
      }
    }
  })

  const headings: HTMLHeadingElement[] = []
  const plainOutline: Outline = {
    sections: [],
  }
  let idIndex = 0
  const walk = (sections: typeof outline["sections"], plainSections: Outline["sections"]) => {
    for (const section of sections) {
      headings.push(section.heading)
      const id = section.heading.id || getHeadingId(idIndex++)
      section.heading.id = id
      const plainSection = {
        id,
        title: section.heading.textContent || "",
        sections: [],
      }
      plainSections.push(plainSection)
      if (section.sections && section.sections.length > 0) {
        walk(section.sections, plainSection.sections)
      }
    }
  }
  walk(outline.sections, plainOutline.sections)

  store.headings = headings
  store.outline = plainOutline

  chrome.runtime
    .sendMessage({
      type: "RLR_SET_OUTLINE",
      payload: plainOutline,
    })
    .catch((err) => {
      //
    })

  for (let i = 0; i < headings.length; i++) {
    try {
      const currentHeading = headings[i]
      const id = currentHeading.id
      currentHeading.dataset[DATASET_START] = id
      ob.observe(currentHeading)
      const mybeEndEl = headings[i + 1]
      if (mybeEndEl) {
        const endEl = getPreviousEl(mybeEndEl)
        if (endEl) {
          endEl.dataset[DATASET_END] = id
          ob.observe(endEl)
        }
      }
    } catch (err) {
      continue
    }
  }
}

init()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "RLR_GET_OUTLINE": {
      sendResponse(store.outline)
      return true
    }
    case "RLR_GET_ACTIVE_ID": {
      // @ts-ignore
      sendResponse(store.activeId)
      return true
    }
    case "RLR_GET_LAST_READ_ID": {
      sendResponse(lastReadId)
      return true
    }
    case "RLR_JUMP": {
      const id = document.querySelector(`[${DATASET_START_ATTR}=${message.payload}]`)?.id
      if (id) {
        console.log("????", id)
        location.hash = id
      }
      break
    }
    default:
      return
  }
})
