let year = '2023'
let month ='9'  
year = parseInt(year);
month = parseInt(month);
const startDate = new Date(year, month - 1, 1);
const lastDay = new Date(year, month, 0); 
const endDate = new Date(year, month - 1, lastDay.getDate()); 
console.log(startDate)
console.log(endDate)

// const startDateString = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
// const endDateString = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;

// console.log(`Starting date: ${startDateString}`);
// console.log(`Ending date: ${endDateString}`);