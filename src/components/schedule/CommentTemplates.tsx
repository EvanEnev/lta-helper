import {Button} from "@heroui/react"

type TemplatesProps = {
  onChange: any
  selected: string
}

const templates = ['Выходной', 'Болезнь', 'По согласованию', 'Учёба']
export default function CommenTemplates(props: TemplatesProps) {
  return (
    <div className="flex flex-wrap gap-2 scrollbar-hide overflow-scroll">
      {templates.map((template, index) => (
        <Button
          key={index}
          onPress={() => props.onChange(template)}
          variant={template === props.selected ? 'faded' : 'flat'}
          className="flex-grow">
          {template}
        </Button>
      ))}
    </div>
  )
}
