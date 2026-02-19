import {RankDescription, RankRequirement} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'
import {
  Button,
  Checkbox,
  Disclosure,
  Separator,
  NumberField,
} from '@heroui/react-beta'
import {Fragment, useMemo} from 'react'
import groupBy from '@/lib/functions/groupBy'

interface RankDataCardProps {
  workerRank: string
  rank: RankDescription
}

export default function RankDataCard({workerRank, rank}: RankDataCardProps) {
  const currentRankData = rank.data

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          currentRankData?.filter(d => !!d.category).map(d => d.category),
        ),
      ),
    [currentRankData],
  )

  const groupedCategories = useMemo(() => {
    if (categories.length === 0) return {}
    if (!currentRankData) return {}

    return groupBy(
      currentRankData.filter(d => !!d.category),
      'category',
    )
  }, [categories.length, currentRankData])

  const done = useMemo(() => {
    const withoutCategories = currentRankData
      ?.filter(d => !d.category && !d.meta?.isChoice)
      .every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))

    const choices = currentRankData?.filter(d => d.meta?.isChoice)

    return (
      withoutCategories &&
      (Object.values(groupedCategories).length
        ? // @ts-ignore
          Object.values(groupedCategories).some((c: RankRequirement[]) =>
            c.every(d => (d.type === 'check' ? d.done : d.value! >= d.limit!)),
          )
        : true) &&
      choices?.some(d => (d.type === 'check' ? d.done : d.value! >= d.limit!))
    )
  }, [currentRankData, groupedCategories])

  return (
    <div className="border-content1-foreground/10 bg-content1 flex w-full flex-col items-center gap-2 rounded-2xl border-2 p-2">
      <RankIcon rank={rank?.rank.name || ''} className="w-30" />
      <p>{rank?.rank.name || ''}</p>
      <Separator />
      {rank.data.length ? (
        <Disclosure
          defaultExpanded={rank.rank.name === workerRank}
          className="flex flex-col items-center gap-2">
          <Disclosure.Heading>
            <Button slot="trigger" variant="secondary">
              Информация о ранге <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content className="flex flex-col justify-center gap-2">
            {rank.data
              .filter(d => !d.category)
              .map((req, index) => {
                return (
                  <Fragment key={req.id}>
                    <div className="flex items-center gap-2">
                      {req.type === 'check' && (
                        <Checkbox
                          className="w-full"
                          isReadOnly
                          defaultSelected={req.done}
                          variant="secondary">
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <p>{req.name}</p>
                        </Checkbox>
                      )}
                      {req.type === 'number' && (
                        <>
                          <p>
                            {req.value || (
                              <span className="text-foreground-500">0</span>
                            )}{' '}
                            / {req.limit}
                          </p>
                          <p>{req.name}</p>
                        </>
                      )}
                    </div>
                    {index !== rank.data.length - 1 && (
                      <Separator className="bg-content1-foreground/50" />
                    )}
                  </Fragment>
                )
              })}
            {categories.length !== 0 && (
              <div
                style={{
                  gridTemplateColumns: `${new Array(categories.length)
                    .fill(0)
                    .map(_ => '1fr')
                    .join(' auto ')}`,
                }}
                className="grid auto-rows-min gap-2">
                {Object.keys(groupedCategories).map((key, index) => {
                  const groupData = groupedCategories[key]

                  return (
                    <Fragment key={key}>
                      <div className="flex flex-col gap-2">
                        <p className="col-span-full mb-2 font-bold">{key}</p>
                        {groupData.map(
                          (req: RankRequirement, index: number) => (
                            <Fragment key={req.id}>
                              <div className="flex gap-2">
                                {req.type === 'check' && (
                                  <Checkbox
                                    className="w-full"
                                    isReadOnly
                                    defaultSelected={req.done}
                                    variant="secondary">
                                    <Checkbox.Control>
                                      <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <p>{req.name}</p>
                                  </Checkbox>
                                )}
                                {req.type === 'number' && (
                                  <>
                                    <NumberField
                                      isReadOnly
                                      defaultValue={req.value || 0}
                                      variant="secondary"
                                      minValue={0}>
                                      <NumberField.Group>
                                        <NumberField.DecrementButton />
                                        <div className="flex items-center gap-2 px-2">
                                          <NumberField.Input
                                            className="mr-0 w-8 pr-0"
                                            placeholder="0"
                                          />
                                          <span>/ {req.limit!}</span>
                                        </div>
                                        <NumberField.IncrementButton />
                                      </NumberField.Group>
                                    </NumberField>
                                    <p>{req.name}</p>
                                  </>
                                )}
                              </div>
                              {index !== groupData.length - 1 && (
                                <Separator className="bg-content1-foreground/50" />
                              )}
                            </Fragment>
                          ),
                        )}
                      </div>
                      {index !== Object.keys(groupedCategories).length - 1 && (
                        <Separator
                          orientation="vertical"
                          className="bg-content1-foreground/50"
                        />
                      )}
                    </Fragment>
                  )
                })}
              </div>
            )}
          </Disclosure.Content>
        </Disclosure>
      ) : (
        <i>Нет информации..</i>
      )}
    </div>
  )
}
