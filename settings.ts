export const production: boolean = true;

export const baseURL: string = production
  ? 'https://abt.qbared.com/api/'
  : 'http://172.20.6.179:8000/api/';
export const baseImageURL: string = production
  ? 'https://abt.qbared.com'
  : 'http://172.20.6.179:8000';

export const version: string = '1.0.10';

export const darkMainColor: string = '#000000';
export const darkSecondColor: string = '#1e1e1e';
export const darkThirdColor: string = '#333333';
export const darkTextColor: string = '#e0e0e0';
export const darkTextSecondColor: string = '#a0a0a0';
export const lightMainColor: string = '#edebeb';
export const lightSecondColor: string = '#f5f5f5';
export const lightTextColor: string = '#333333';