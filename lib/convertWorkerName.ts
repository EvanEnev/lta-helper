export default function converWorkerName(workerName: string) {
    return workerName.trim().split('(')[0].split(' ')[0]
}