import publicApi from "../interceptor/api";

export const apiService = {
  getDatabases: async () => {
    // const res = await publicApi.get("/namespaces");
    // return res.data;
    return [{name: "asd", totalSets: 4}]
  },

  getTables: async (dbName: string) => {
    // const res = await publicApi.get(`/${dbName}/sets`);
    // return res.data;
    return [{name: "asdss", rowCount: 3}]
  },

  getTableRecords: async (dbName: string, tableName: string, page = 1, take = 10) => {
    // const res = await publicApi.get(`/namespaces/${dbName}/sets/${tableName}/records`, {
    //   params: { page, take },
    // });
    // return res.data;
    return {
    "page": 1,
    "take": 20,
    "totalRecords": 4,
    "totalPages": 1,
    "records": [
        {
            "meta": {
                "key": "user2",
                "types": {
                    "name": "STRING",
                    "age": "INTEGER",
                    "email": "STRING"
                }
            },
            "data": {
                "name": "Sara",
                "age": 24,
                "email": "sara@example.com"
            }
        },
        {
            "meta": {
                "key": "user3",
                "types": {
                    "name": "STRING",
                    "age": "INTEGER",
                    "email": "STRING"
                }
            },
            "data": {
                "name": "Zain",
                "age": 32,
                "email": "zain@example.com"
            }
        },
        {
            "meta": {
                "key": "user1",
                "types": {
                    "name": "STRING",
                    "age": "INTEGER",
                    "email": "STRING"
                }
            },
            "data": {
                "name": "Ali",
                "age": 28,
                "email": "ali@example.com"
            }
        },
        {
            "meta": {
                "key": "1",
                "types": {
                    "name": "STRING",
                    "email": "STRING"
                }
            },
            "data": {
                "name": "John Doe",
                "email": "user1@example.com"
            }
        }
    ]
}
  },
};