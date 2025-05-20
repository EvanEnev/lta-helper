'use client'

import {SalaryData, SalaryUser, UserSalary} from "@/src/utils/types";
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {useMemo} from "react";
import Cell from "./Cell";
import InfoCell from "@/src/components/salary/InfoCell";
import {RowData} from "@tanstack/react-table";
import WorkerCell from "@/src/components/salary/WorkerCell";

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        frozen?: boolean
        fixedPosition?: number
    }
}

export default function Table({data}: {data: UserSalary[]}) {
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }


    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)

    const columns = useMemo(() => {
        const baseColumns = [
            {header: 'Позывной', accessorKey: 'user',
                cell: ({getValue}: {getValue: () => SalaryUser}) => <WorkerCell data={getValue()} />,
                meta: {frozen: true, fixedPosition: 0}},
            {header: 'Информация', accessorKey: 'info', cell: () => <InfoCell />, meta: {frozen: true, fixedPosition: 1}}
        ]

        const daysColumns = Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1
            const date = new Date(currentYear, currentMonth, day)
            const dateValue = date.toLocaleDateString('ru-ru', { day: 'numeric', month: 'numeric' })

            return {
                header: dateValue,
                accessorKey: `day${i}`,
                cell: ({getValue}: {getValue: () => SalaryData | undefined}) => <Cell data={getValue()}/>
            }
        })

        return [...baseColumns, ...daysColumns]
    }, [currentMonth, currentYear, daysInMonth])
    const table = useReactTable({data, columns, getCoreRowModel: getCoreRowModel()})

    const getFixedColumnLeftPosition = (fixedIndex: number = 0) => {
        let leftOffset = 0;
        const columns = table.getAllColumns()
        for (let i = 0; i < fixedIndex; i++) {
            leftOffset += columns[i].getSize();
        }

        return leftOffset;
    };
    return <div className="overflow-auto relative">
        <div className="text-xl font-bold mb-4">
            {new Date(currentYear, currentMonth).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </div>
        <table className="min-w-full divide-x-4 divide-y divide-gray-200">
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                        <th
                            key={header.id}
                            className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider ${index === 1 ? 'rounded-tr-2xl' : ''} ${index > 0 && index !== 1 ? 'border-l border-t border-gray-50' : ''} ${header.column.columnDef.meta?.frozen ? 'sticky z-100 bg-content2 shadow-sm' : ''}`}
                            style={{
                                width: header.getSize(),
                                minWidth: header.getSize(),
                                ...(header.column.columnDef.meta?.frozen && { left: getFixedColumnLeftPosition(header.column.columnDef.meta?.fixedPosition) })
                            }}
                        >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </th>
                    ))}
                </tr>
            ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
                <tr key={row.id} className='h-[10rem]'>
                    {row.getVisibleCells().map((cell, index) => (
                        <td
                            key={cell.id}
                            className={`p-2 text-sm text-center w-[10rem] min-w-[10rem] ${index > 0 ? 'border-l border-gray-50' : ''} ${cell.column.columnDef.meta?.frozen ? 'sticky z-100 bg-content2 shadow-sm' : ''}`}
                            style={{
                                ...(cell.column.columnDef.meta?.frozen && { left: getFixedColumnLeftPosition(cell.column.columnDef.meta?.fixedPosition) })
                            }}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
}
