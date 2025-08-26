interface PayrollsCreateProps {
    params: Promise<{dates: string}>
}

export default async function PayrollsCreate({params}: PayrollsCreateProps) {
    const {dates} = await params
}