import {Button} from '@nextui-org/react'

type TemplatesProps = {
  onChange: any
  selected: string
}

const templates = ['Выходной', 'Болезнь', 'По согласнованию']
export default function CommenTemplates(props: TemplatesProps) {
  return (
    <div className="flex gap-2">
      {templates.map((template, index) => (
        <Button
          key={index}
          onPress={() => props.onChange(template)}
          variant={template === props.selected ? 'faded' : 'flat'}
          className="grow">
          {template}
        </Button>
      ))}
    </div>
  )
}
