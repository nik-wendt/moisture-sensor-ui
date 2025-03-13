import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8001/"
});


export const getSensorData = async(params) => {
    const response =  await api.get('sensor-data', {params});
    return response.data;
}

export const getSensorDetail = async(id, { start_date = null, end_date = null } = {}) => {
    const response = await api.get(`sensor-data/${id}`, {
        params: {start_date, end_date}

    });
    return response.data
}

export const updateSensor = async(id, data) => {
    const response = await api.patch(`sensor-data/${id}`, data)
    return response.data
}