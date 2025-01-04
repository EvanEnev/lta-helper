type RankSalary = {[key: string]: {default: number, overWork: number}}

const salaries: RankSalary = {
    'актёр': {
        default: 1500,
        overWork: 500
    },
    'каменный': {
        default: 2000,
        overWork: 150
    },
    'железный': {
        default: 2000,
        overWork: 200
    },
    'бронзовый': {
        default: 2000,
        overWork: 250
    },
    'серебряный': {
        default: 2500,
        overWork: 250
    },
    'золотой': {
        default: 3000,
        overWork: 300
    },
    'платиновый': {
        default: 4000,
        overWork: 400
    }

}


export default salaries