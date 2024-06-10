import axiosInstance from "./axios";


export const getJobs = async (userName:string) => {
    await axiosInstance
    .get(`jobs/list/${userName}/`)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        console.error('Error fetching jobs:', error);
        return error
    });
};