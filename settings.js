
export const production = true;

let baseURL;
let baseImageURL;

if (production) {
    baseURL = 'https://abt.qbared.com/api/';
    baseImageURL = 'https://abt.qbared.com';
} else {
    baseURL = 'http://172.20.6.179:8000/api/';
    baseImageURL = 'http://172.20.6.179:8000';
}

export { baseURL, baseImageURL };

export const darkMainColor = '#000000';
export const darkSecondColor = '#1e1e1e';
export const darkThirdColor = '#333333';
export const darkTtextColor = '#e0e0e0';
export const darkTtextSecondColor = '#a0a0a0';
export const lightMainColor = '#edebeb';
export const lightSecondColor = '#f5f5f5';
export const lightTextColor = '#333333';