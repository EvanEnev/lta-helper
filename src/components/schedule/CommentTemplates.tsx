import {Button} from '@heroui/react'

type TemplatesProps = {
  onChange: any
  selected: string
}

const templates = ['Выходной', 'Болезнь', 'Учёба']
export default function CommentTemplates(props: TemplatesProps) {
  return (
    <div className="scrollbar-hide flex flex-wrap gap-2 overflow-scroll">
      {templates.map((template, index) => (
        <Button
          key={index}
          onPress={() => props.onChange(template)}
          variant={template === props.selected ? 'tertiary' : 'outline'}
          className="grow">
          {template}
        </Button>
      ))}
    </div>
  )
}
