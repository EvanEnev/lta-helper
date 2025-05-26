import {ReactNode} from "react";

export default function CellChip({children, className = ''}: {children: ReactNode | ReactNode[], className?: string}) {
    return <div className={`bg-default-100 rounded-medium px-3 min-h-10 h-10 w-full items-center inline-flex relative text-xs text-start ${className}`}>
        {children}
    </div>
}
