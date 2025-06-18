import api from "../../services/api";

const useCompanies = () => {

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companies',
            method: 'POST',
            data
        });
        return responseData;
    }

    const findAll = async (id) => {
        const { data } = await api.request({
            url: `/companies`,
            method: 'GET'
        });
        return data;
    }

    const list = async (id) => {
        const { data } = await api.request({
            url: `/companies/list`,
            method: 'GET'
        });
        return data;
    }

    const find = async (id) => {
        if (!id) {
            throw new Error("Company ID is required");
        }
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'GET'
        });
        return data;
    }

    const finding = async (id) => {
        if (!id) {
            throw new Error("Company ID is required");
        }
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'GET'
        });
        return data;
    }

    const update = async (data) => {
        if (!data.id) {
            throw new Error("Company ID is required");
        }
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        if (!id) {
            throw new Error("Company ID is required");
        }
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const updateSchedules = async (data) => {
        if (!data.id) {
            throw new Error("Company ID is required");
        }
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}/schedules`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    return {
        save,
        update,
        remove,
        list,
        find,
        finding,
        findAll,
        updateSchedules
    }
}

export default useCompanies;