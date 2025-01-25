import {Button} from '@nextui-org/react'

type TemplatesProps = {
  onChange: any
  selected: string
}

const templates = ['Выходной', 'Болезнь', 'По согласованию', 'Учёба']
export default function CommenTemplates(props: TemplatesProps) {
  return (
    <div className="flex gap-2 scrollbar-hide overflow-scroll">
      {templates.map((template, index) => (
        <Button
          key={index}
          onPress={() => props.onChange(template)}
          variant={template === props.selected ? 'faded' : 'flat'}
          className="flex-grow min-w-[8rem]">
          {template}
        </Button>
      ))}
    </div>
  )
}
