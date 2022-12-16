declare module "h5o" {
  type Section = {
    heading: HTMLHeadingElement
    sections: Section[]
  }
  type Outline = {
    sections: Section[]
    asHTML(): string
  }
  function createOutline(el: any): Outline

  export default createOutline
}

type Section = {
  id: string
  title: string
  sections: Section[]
}
type Outline = {
  sections: Section[]
}
