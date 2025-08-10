export const production: boolean = true;

export const baseURL: string = production
  ? 'https://abt.qbared.com/api/'
  : 'http://172.20.6.179:8000/api/';
export const baseImageURL: string = production
  ? 'https://abt.qbared.com'
  : 'http://172.20.6.179:8000';

export const version: string = '1.0.12';

export const darkMainColor: string = '#000000';
export const darkSecondColor: string = '#2A2A2A';
export const darkThirdColor: string = '#333333';
export const darkTextColor: string = '#e0e0e0';
export const darkTextSecondColor: string = '#a0a0a0';
export const lightMainColor: string = '#edebeb';
export const lightSecondColor: string = '#f5f5f5';
export const lightTextColor: string = '#333333';

export const userImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/userDefault.jpg';
export const jobImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/jobDefault.jpg';
export const spentImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/spentDefault.jpg';
export const itemImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/itemDefault.jpg';
export const businessExpenseImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/expenseDefault.jpg';
export const businessIncomeImageDefault: string = 'https://abt-media.nyc3.cdn.digitaloceanspaces.com/incomeDefault.jpg';
