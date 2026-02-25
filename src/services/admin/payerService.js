import api from "../api";
import axios from "axios";
import { API_URL_PRODUCTION } from "../../constants/apiConstants";
import { API_URL_DEVELOP } from "../../constants/apiConstants";

const createEntity = async (data) => {
  try {

    data.entityType = true; 

    const response = axios.post(`${API_URL_DEVELOP}/entities/create`, data, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error("Error creating payer:", error);
    throw error;
  }
}

const getEntities = async () => {
  try {
    const response = await api.get(`/entities/type?isEntityType=true`);
    return response;
  } catch (error) {
    console.error("Error fetching payers:", error);
    throw error;
  }
}

const getAllEntities = async () => {
  try {
    const response = await api.get('/entities/all');
    return response;
  } catch (error) {
    console.error("Error fetching all entities:", error);
    throw error;
  }
}

export const payerService = {
  createEntity,
  getEntities,
  getAllEntities
}