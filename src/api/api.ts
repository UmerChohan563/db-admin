import publicApi from "../interceptor/api";

export const apiService = {
  getDatabases: async () => {
    const res = await publicApi.get("/namespaces");
    return res.data;
  },

  getTables: async (dbName: string) => {
    const res = await publicApi.get(`/namespaces/${dbName}/sets`);
    return res.data;
  },

  getTableSchema: async (dbName: string, tableName: string) => {
    const res = await publicApi.get(`/sets/${dbName}/${tableName}/schema`);
    return res.data;
  },

  getTableRecords: async (dbName: string, tableName: string, page = 1, take = 10) => {
    const res = await publicApi.get(`/namespaces/${dbName}/sets/${tableName}/records`, {
      params: { page, take },
    });
    return res.data;
  },
};