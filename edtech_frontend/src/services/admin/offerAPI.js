import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const getHeaders = (token) => {
  const adminToken = token || localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getAllOffers = async (params = {}, token) => {
  return await axios.get(`${BASE_URL}/admin/offers`, {
    ...getHeaders(token),
    params
  });
};

export const getOfferById = async (id, token) => {
  return await axios.get(`${BASE_URL}/admin/offers/${id}`, getHeaders(token));
};

export const createOffer = async (offerData, token) => {
  return await axios.post(`${BASE_URL}/admin/offers`, offerData, getHeaders(token));
};

export const updateOffer = async (id, offerData, token) => {
  return await axios.put(`${BASE_URL}/admin/offers/${id}`, offerData, getHeaders(token));
};

export const updateOfferStatus = async (id, status, token) => {
  return await axios.patch(`${BASE_URL}/admin/offers/${id}/status`, { status }, getHeaders(token));
};

export const duplicateOffer = async (id, token) => {
  return await axios.post(`${BASE_URL}/admin/offers/${id}/duplicate`, {}, getHeaders(token));
};

export const deleteOffer = async (id, token) => {
  return await axios.delete(`${BASE_URL}/admin/offers/${id}`, getHeaders(token));
};
